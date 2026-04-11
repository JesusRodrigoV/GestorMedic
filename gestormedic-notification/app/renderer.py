from jinja2 import Environment, FileSystemLoader, select_autoescape, Template
import os

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")

env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR), autoescape=select_autoescape(["html", "xml"])
)


def render_notification(
    event_type: str, channel: str, data: dict, custom_content: str = None
) -> str:
    if custom_content:
        template = Template(custom_content)
        return template.render(**data)

    extension = "html" if channel.lower() == "email" else "txt"
    event_key = event_type.lower()

    specific_template = f"{event_key}_{channel.lower()}.{extension}"
    generic_template = f"{event_key}.txt"

    try:
        template = env.get_template(specific_template)
    except Exception:
        template = env.get_template(generic_template)

    return template.render(**data)
