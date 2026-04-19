import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
  signal,
} from '@angular/core';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';
import * as Hammer from 'hammerjs';

let isCornerstoneReady = false;

function initCornerstoneTools() {
  if (isCornerstoneReady) {
    return;
  }

  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.Hammer = Hammer;

  cornerstoneTools.init({
    showSVGCursor: true,
  });

  cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
  cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
  cornerstoneTools.addTool(cornerstoneTools.PanTool);
  cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
  cornerstoneTools.addTool(cornerstoneTools.StackScrollTool);

  isCornerstoneReady = true;
}

@Component({
  selector: 'gm-dicom-advanced-viewer',
  templateUrl: './dicom-advanced-viewer.html',
  styleUrl: './dicom-advanced-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DicomAdvancedViewer implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('dicomViewport', { static: true })
  private dicomViewport!: ElementRef<HTMLDivElement>;

  readonly dicomUrls = input.required<string[]>();
  readonly fileName = input<string>('DICOM');

  readonly currentTool = signal<'wl' | 'zoom' | 'pan'>('wl');
  readonly currentIndex = signal(0);
  readonly totalImages = signal(0);
  readonly isLoading = signal(false);

  get maxStackIndex(): number {
    return Math.max(0, this.totalImages() - 1);
  }

  private imageIds: string[] = [];
  private elementEnabled = false;

  async ngAfterViewInit(): Promise<void> {
    initCornerstoneTools();
    this.enableElement();
    await this.loadStack();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['dicomUrls'] && this.elementEnabled) {
      await this.loadStack();
    }
  }

  ngOnDestroy(): void {
    if (this.elementEnabled) {
      cornerstone.disable(this.dicomViewport.nativeElement);
      this.elementEnabled = false;
    }
  }

  async useTool(tool: 'wl' | 'zoom' | 'pan'): Promise<void> {
    this.currentTool.set(tool);
    cornerstoneTools.setToolDisabled('Wwwc');
    cornerstoneTools.setToolDisabled('Zoom');
    cornerstoneTools.setToolDisabled('Pan');

    if (tool === 'wl') {
      cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
    }
    if (tool === 'zoom') {
      cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 1 });
    }
    if (tool === 'pan') {
      cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
    }
  }

  async goToIndex(index: number): Promise<void> {
    if (index < 0 || index >= this.imageIds.length) {
      return;
    }
    const image = await cornerstone.loadAndCacheImage(this.imageIds[index]);
    cornerstone.displayImage(this.dicomViewport.nativeElement, image);
    this.currentIndex.set(index);
  }

  async zoomIn(): Promise<void> {
    const viewport = cornerstone.getViewport(this.dicomViewport.nativeElement);
    viewport.scale += 0.2;
    cornerstone.setViewport(this.dicomViewport.nativeElement, viewport);
  }

  async zoomOut(): Promise<void> {
    const viewport = cornerstone.getViewport(this.dicomViewport.nativeElement);
    viewport.scale = Math.max(0.1, viewport.scale - 0.2);
    cornerstone.setViewport(this.dicomViewport.nativeElement, viewport);
  }

  async resetView(): Promise<void> {
    cornerstone.reset(this.dicomViewport.nativeElement);
  }

  private enableElement(): void {
    if (this.elementEnabled) {
      return;
    }
    cornerstone.enable(this.dicomViewport.nativeElement);
    cornerstoneTools.addStackStateManager(this.dicomViewport.nativeElement, ['stack']);
    this.elementEnabled = true;

    this.dicomViewport.nativeElement.addEventListener('cornerstoneimagerendered', () => {
      const stackState = cornerstoneTools.getToolState(this.dicomViewport.nativeElement, 'stack');
      const state = stackState?.data?.[0];
      if (state) {
        this.currentIndex.set(state.currentImageIdIndex || 0);
      }
    });
  }

  private async loadStack(): Promise<void> {
    const urls = this.dicomUrls();
    if (!urls?.length) {
      return;
    }

    this.isLoading.set(true);

    this.imageIds = [];
    for (const url of urls) {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], this.fileName(), { type: 'application/dicom' });
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
      this.imageIds.push(imageId);
    }

    const first = await cornerstone.loadAndCacheImage(this.imageIds[0]);
    cornerstone.displayImage(this.dicomViewport.nativeElement, first);

    const stack = {
      currentImageIdIndex: 0,
      imageIds: this.imageIds,
    };

    cornerstoneTools.clearToolState(this.dicomViewport.nativeElement, 'stack');
    cornerstoneTools.addToolState(this.dicomViewport.nativeElement, 'stack', stack);
    cornerstoneTools.setToolActive('StackScrollMouseWheel', {});
    cornerstoneTools.setToolActive('StackScroll', { mouseButtonMask: 4 });

    this.totalImages.set(this.imageIds.length);
    this.currentIndex.set(0);
    this.isLoading.set(false);
    await this.useTool(this.currentTool());
  }
}
