import json
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, bytes):
            return str(obj, encoding='utf-8')
        if isinstance(obj, datetime.date):
            return obj.strftime('%Y/%m/%d')
        return json.JSONEncoder.default(self, obj)
