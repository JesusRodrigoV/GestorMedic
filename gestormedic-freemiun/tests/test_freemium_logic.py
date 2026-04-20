from datetime import UTC, datetime

from app.services.freemium_service import next_billing_date, period_key_from_date


def test_period_key_from_date():
    dt = datetime(2026, 4, 20, tzinfo=UTC)
    assert period_key_from_date(dt) == '2026-04'


def test_next_billing_monthly_rollover_year():
    dt = datetime(2026, 12, 10, 9, 30, tzinfo=UTC)
    nxt = next_billing_date(dt, 'monthly')
    assert nxt.year == 2027
    assert nxt.month == 1
    assert nxt.day == 10


def test_next_billing_annual():
    dt = datetime(2026, 4, 20, tzinfo=UTC)
    nxt = next_billing_date(dt, 'annual')
    assert nxt.year == 2027
    assert nxt.month == 4
    assert nxt.day == 20
