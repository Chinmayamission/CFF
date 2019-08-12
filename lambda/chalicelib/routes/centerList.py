from chalice import UnauthorizedError
from pydash.objects import pick
import datetime


def center_list():
    from ..main import app

    userId = app.get_current_user_id()
    # todo: change this to a batch get.
    centers = TABLES.cm_centers.find({"type": "center"})
    return {"res": centers}
