from src.db.actions.actions_General import executeReadQuery


def getRoutesFromDB(network_DbId, dex_DbId, inToken_DbId, outToken_DbId):

    # Build Route Query
    query = f"SELECT " \
            f"routes.route_id, routes.route, routes.dex_id, routes.method, routes.amount_in, routes.amount_out " \
            f"FROM " \
            f"routes " \
            f"WHERE " \
            f"routes.network_id = {network_DbId} " \
            f"AND " \
            f"routes.dex_id = {dex_DbId} " \
            f"AND " \
            f"routes.token_in_id = {inToken_DbId} " \
            f"AND " \
            f"routes.token_out_id = {outToken_DbId}"

    # Query DB For Routes
    routes = executeReadQuery(
        query=query
    )

    return routes