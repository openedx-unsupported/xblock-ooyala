# Test mocks and helpers
import datetime
from xblock.runtime import DictKeyValueStore, KvsFieldData
from xblock.test.tools import TestRuntime


class MockNow(object):
    """
    Provides a mock timestamp and now() method.

    Usage:
        @mock.patch("datetime.datetime", new=MockNow(10**10))
        def test_something():
            ...

    """
    def __init__(self, mock_timestamp):
        self._old_datetime = datetime.datetime
        self.mock_timestamp = mock_timestamp

    def now(self):
        return self._old_datetime.fromtimestamp(self.mock_timestamp)


class MockRuntime(TestRuntime):
    """
    Provides a mock XBlock runtime object.
    """
    def __init__(self, **kwargs):
        field_data = kwargs.get('field_data', KvsFieldData(DictKeyValueStore()))
        super(MockRuntime, self).__init__(field_data=field_data)
