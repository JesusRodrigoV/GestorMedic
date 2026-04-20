from app.db.bootstrap import _split_sql_statements


def test_split_sql_statements_ignores_empty_chunks():
    sql = "SELECT 1;  ;\nSELECT 2;\n\n;"
    result = _split_sql_statements(sql)
    assert result == ['SELECT 1', 'SELECT 2']
