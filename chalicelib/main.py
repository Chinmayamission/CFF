import boto3
from boto3.dynamodb.conditions import Key
from chalice import Chalice, AuthResponse, CognitoUserPoolAuthorizer, IAMAuthorizer, UnauthorizedError
from chalicelib import routes
import datetime
import json
import os
import re
import uuid
from pymongo import MongoClient
import pymodm
import logging
DYNAMODB_RESERVED_KEYWORDS = ("ABORT","ABSOLUTE","ACTION","ADD","AFTER","AGENT","AGGREGATE","ALL","ALLOCATE","ALTER","ANALYZE","AND","ANY","ARCHIVE","ARE","ARRAY","AS","ASC","ASCII","ASENSITIVE","ASSERTION","ASYMMETRIC","AT","ATOMIC","ATTACH","ATTRIBUTE","AUTH","AUTHORIZATION","AUTHORIZE","AUTO","AVG","BACK","BACKUP","BASE","BATCH","BEFORE","BEGIN","BETWEEN","BIGINT","BINARY","BIT","BLOB","BLOCK","BOOLEAN","BOTH","BREADTH","BUCKET","BULK","BY","BYTE","CALL","CALLED","CALLING","CAPACITY","CASCADE","CASCADED","CASE","CAST","CATALOG","CHAR","CHARACTER","CHECK","CLASS","CLOB","CLOSE","CLUSTER","CLUSTERED","CLUSTERING","CLUSTERS","COALESCE","COLLATE","COLLATION","COLLECTION","COLUMN","COLUMNS","COMBINE","COMMENT","COMMIT","COMPACT","COMPILE","COMPRESS","CONDITION","CONFLICT","CONNECT","CONNECTION","CONSISTENCY","CONSISTENT","CONSTRAINT","CONSTRAINTS","CONSTRUCTOR","CONSUMED","CONTINUE","CONVERT","COPY","CORRESPONDING","COUNT","COUNTER","CREATE","CROSS","CUBE","CURRENT","CURSOR","CYCLE","DATA","DATABASE","DATE","DATETIME","DAY","DEALLOCATE","DEC","DECIMAL","DECLARE","DEFAULT","DEFERRABLE","DEFERRED","DEFINE","DEFINED","DEFINITION","DELETE","DELIMITED","DEPTH","DEREF","DESC","DESCRIBE","DESCRIPTOR","DETACH","DETERMINISTIC","DIAGNOSTICS","DIRECTORIES","DISABLE","DISCONNECT","DISTINCT","DISTRIBUTE","DO","DOMAIN","DOUBLE","DROP","DUMP","DURATION","DYNAMIC","EACH","ELEMENT","ELSE","ELSEIF","EMPTY","ENABLE","END","EQUAL","EQUALS","ERROR","ESCAPE","ESCAPED","EVAL","EVALUATE","EXCEEDED","EXCEPT","EXCEPTION","EXCEPTIONS","EXCLUSIVE","EXEC","EXECUTE","EXISTS","EXIT","EXPLAIN","EXPLODE","EXPORT","EXPRESSION","EXTENDED","EXTERNAL","EXTRACT","FAIL","FALSE","FAMILY","FETCH","FIELDS","FILE","FILTER","FILTERING","FINAL","FINISH","FIRST","FIXED","FLATTERN","FLOAT","FOR","FORCE","FOREIGN","FORMAT","FORWARD","FOUND","FREE","FROM","FULL","FUNCTION","FUNCTIONS","GENERAL","GENERATE","GET","GLOB","GLOBAL","GO","GOTO","GRANT","GREATER","GROUP","GROUPING","HANDLER","HASH","HAVE","HAVING","HEAP","HIDDEN","HOLD","HOUR","IDENTIFIED","IDENTITY","IF","IGNORE","IMMEDIATE","IMPORT","IN","INCLUDING","INCLUSIVE","INCREMENT","INCREMENTAL","INDEX","INDEXED","INDEXES","INDICATOR","INFINITE","INITIALLY","INLINE","INNER","INNTER","INOUT","INPUT","INSENSITIVE","INSERT","INSTEAD","INT","INTEGER","INTERSECT","INTERVAL","INTO","INVALIDATE","IS","ISOLATION","ITEM","ITEMS","ITERATE","JOIN","KEY","KEYS","LAG","LANGUAGE","LARGE","LAST","LATERAL","LEAD","LEADING","LEAVE","LEFT","LENGTH","LESS","LEVEL","LIKE","LIMIT","LIMITED","LINES","LIST","LOAD","LOCAL","LOCALTIME","LOCALTIMESTAMP","LOCATION","LOCATOR","LOCK","LOCKS","LOG","LOGED","LONG","LOOP","LOWER","MAP","MATCH","MATERIALIZED","MAX","MAXLEN","MEMBER","MERGE","METHOD","METRICS","MIN","MINUS","MINUTE","MISSING","MOD","MODE","MODIFIES","MODIFY","MODULE","MONTH","MULTI","MULTISET","NAME","NAMES","NATIONAL","NATURAL","NCHAR","NCLOB","NEW","NEXT","NO","NONE","NOT","NULL","NULLIF","NUMBER","NUMERIC","OBJECT","OF","OFFLINE","OFFSET","OLD","ON","ONLINE","ONLY","OPAQUE","OPEN","OPERATOR","OPTION","OR","ORDER","ORDINALITY","OTHER","OTHERS","OUT","OUTER","OUTPUT","OVER","OVERLAPS","OVERRIDE","OWNER","PAD","PARALLEL","PARAMETER","PARAMETERS","PARTIAL","PARTITION","PARTITIONED","PARTITIONS","PATH","PERCENT","PERCENTILE","PERMISSION","PERMISSIONS","PIPE","PIPELINED","PLAN","POOL","POSITION","PRECISION","PREPARE","PRESERVE","PRIMARY","PRIOR","PRIVATE","PRIVILEGES","PROCEDURE","PROCESSED","PROJECT","PROJECTION","PROPERTY","PROVISIONING","PUBLIC","PUT","QUERY","QUIT","QUORUM","RAISE","RANDOM","RANGE","RANK","RAW","READ","READS","REAL","REBUILD","RECORD","RECURSIVE","REDUCE","REF","REFERENCE","REFERENCES","REFERENCING","REGEXP","REGION","REINDEX","RELATIVE","RELEASE","REMAINDER","RENAME","REPEAT","REPLACE","REQUEST","RESET","RESIGNAL","RESOURCE","RESPONSE","RESTORE","RESTRICT","RESULT","RETURN","RETURNING","RETURNS","REVERSE","REVOKE","RIGHT","ROLE","ROLES","ROLLBACK","ROLLUP","ROUTINE","ROW","ROWS","RULE","RULES","SAMPLE","SATISFIES","SAVE","SAVEPOINT","SCAN","SCHEMA","SCOPE","SCROLL","SEARCH","SECOND","SECTION","SEGMENT","SEGMENTS","SELECT","SELF","SEMI","SENSITIVE","SEPARATE","SEQUENCE","SERIALIZABLE","SESSION","SET","SETS","SHARD","SHARE","SHARED","SHORT","SHOW","SIGNAL","SIMILAR","SIZE","SKEWED","SMALLINT","SNAPSHOT","SOME","SOURCE","SPACE","SPACES","SPARSE","SPECIFIC","SPECIFICTYPE","SPLIT","SQL","SQLCODE","SQLERROR","SQLEXCEPTION","SQLSTATE","SQLWARNING","START","STATE","STATIC","STATUS","STORAGE","STORE","STORED","STREAM","STRING","STRUCT","STYLE","SUB","SUBMULTISET","SUBPARTITION","SUBSTRING","SUBTYPE","SUM","SUPER","SYMMETRIC","SYNONYM","SYSTEM","TABLE","TABLESAMPLE","TEMP","TEMPORARY","TERMINATED","TEXT","THAN","THEN","THROUGHPUT","TIME","TIMESTAMP","TIMEZONE","TINYINT","TO","TOKEN","TOTAL","TOUCH","TRAILING","TRANSACTION","TRANSFORM","TRANSLATE","TRANSLATION","TREAT","TRIGGER","TRIM","TRUE","TRUNCATE","TTL","TUPLE","TYPE","UNDER","UNDO","UNION","UNIQUE","UNIT","UNKNOWN","UNLOGGED","UNNEST","UNPROCESSED","UNSIGNED","UNTIL","UPDATE","UPPER","URL","USAGE","USE","USER","USERS","USING","UUID","VACUUM","VALUE","VALUED","VALUES","VARCHAR","VARIABLE","VARIANCE","VARINT","VARYING","VIEW","VIEWS","VIRTUAL","VOID","WAIT","WHEN","WHENEVER","WHERE","WHILE","WINDOW","WITH","WITHIN","WITHOUT","WORK","WRAPPED","WRITE","YEAR","ZONE")

# client = MongoClient(os.getenv("MONGO_CONN_STR"))

def get_table_name(name):
    if name in ["responses", "schemaModifiers", "schemas", "forms", "centers", "centres", "users"]:
        return "{}.{}".format(os.getenv("TABLE_PREFIX"), name)
    else:
        return name

# dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
class TABLES_CLASS:
    responses = None
    forms = None
    schemas = None
    schemaModifiers = None
    centers = None
    users = None
    cm = None
TABLES = TABLES_CLASS()

# os.environ["MONGO_HOST"] = "mongodb://chinmayamission.documents.azure.com:10255/cm?ssl=true&replicaSet=globaldb"
# os.environ["MONGO_USER"] = "chinmayamission"
# os.environ["MONGO_PASSWORD"] = "uDZoH8UVbBLft8dUdpQTlImwNjHMWVW3w6UDGMBSxVtSgCmftIDYEJuhDL6F8RP8eyNKzccDlxPPYYsLoVHn9A=="

ssm = boto3.client('ssm', 'us-east-1')
MODE = os.getenv("MODE", "DEV")
PROD = False
if MODE == "DEV":
    host = "mongodb://localhost:10255/admin?ssl=true"
    user = "localhost"
    password = "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=="
    pymodm.connection.connect(host, username=user, password=password)
elif MODE == "BETA":
    mongo_conn_str = ssm.get_parameter(Name='CFF_COSMOS_CONN_STR_WRITE_BETA', WithDecryption=True)['Parameter']['Value']
    pymodm.connection.connect(mongo_conn_str)
    #pymodm.connection.connect
elif MODE == "PROD":
    mongo_conn_str = ssm.get_parameter(Name='CFF_COSMOS_CONN_STR_WRITE_PROD', WithDecryption=True)['Parameter']['Value']
    pymodm.connection.connect(mongo_conn_str)
    PROD = True

"""
self.current_request.context
{
	'resourceId': 'rvekmq',
	'authorizer': {
		'claims': {
			'sub': 'f31c1cb8-681c-4d3e-9749-d7c074ffd7f6',
			'email_verified': 'true',
			'iss': 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_kcpcLxLzn',
			'cognito:username': 'f31c1cb8-681c-4d3e-9749-d7c074ffd7f6',
			'aud': '77mcm1k9ll2ge68806h5kncfus',
			'event_id': '998e73be-869c-11e8-bc84-eb52bf60dda3',
			'token_use': 'id',
			'custom:center': 'CCMT',
			'auth_time': '1531486778',
			'name': 'Ashwin Ramaswami',
			'exp': 'Fri Jul 13 15:15:16 UTC 2018',
			'iat': 'Fri Jul 13 14:15:16 UTC 2018',
			'email': 'aramaswamis@gmail.com'
		}
	},
	'resourcePath': '/forms',
	'httpMethod': 'GET',
	'extendedRequestId': 'J-FZ2HZIIAMFVtw=',
	'requestTime': '13/Jul/2018:14:23:20 +0000',
	'path': '/v2/forms',
	'accountId': '131049698002',
	'protocol': 'HTTP/1.1',
	'stage': 'v2',
	'requestTimeEpoch': 1531491800643,
	'requestId': '4b0ad9d2-86a8-11e8-af8e-496539b4a5e9',
	'identity': {
		'cognitoIdentityPoolId': None,
		'accountId': None,
		'cognitoIdentityId': None,
		'caller': None,
		'sourceIp': '192.127.94.7',
		'accessKey': None,
		'cognitoAuthenticationType': None,
		'cognitoAuthenticationProvider': None,
		'userArn': None,
		'userAgent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
		'user': None
	},
	'apiId': '5fd3dqj2dc'
}
"""

class CustomChalice(Chalice):
    test_user_id = None
    def get_url(self, path=''):
        if os.getenv("UNIT_TEST") == "TRUE":
            return f"dummy://{path}"
        headers = self.current_request.headers
        return '%s://%s/%s%s' % (headers['x-forwarded-proto'],
                            headers['host'],
                            self.current_request.context['stage'],
                            path)
    def get_current_user_id(self):
        """Get current user id."""
        id = None
        try:
            id = self.current_request.context['authorizer']['claims']['sub']
        except (KeyError, AttributeError):
            if app.test_user_id: id = app.test_user_id
            if not id: return "cm:anonymousUser"
        return "cm:cognitoUserPool:{}".format(id)
    def get_user_permissions(self, id, model):
        """id = user id. model = model with cff_permissions in it."""
        cff_permissions = getattr(model, "cff_permissions", {})
        current_user_perms = {}
        if id is not "cm:anonymousUser":
            current_user_perms.update(cff_permissions.get("cm:loggedInUser", {}))
        current_user_perms.update(cff_permissions.get(id, {}))
        return current_user_perms
    def check_permissions(self, model, actions):
        if type(actions) is str:
            actions = [actions]
        actions.append("owner")
        id = self.get_current_user_id()
        current_user_perms = self.get_user_permissions(id, model)
        if any((a in current_user_perms and current_user_perms[a] == True) for a in actions):
            return True
        else:
            raise UnauthorizedError("User {} is not authorized to perform action {} on this resource.".format(id, actions))

app = CustomChalice(app_name='ccmt-cff-rest-api')
# app = Chalice(app_name='ccmt-cff-rest-api')
if MODE != "PROD":
    app.debug = True
    app.log.setLevel(logging.DEBUG)

# This hack allows for integration testing.
test_user_id = os.getenv("DEV_COGNITO_IDENTITY_ID") or None
if test_user_id:
    app.test_user_id = test_user_id

iamAuthorizer = CognitoUserPoolAuthorizer(
    'CCMT', provider_arns=['arn:aws:cognito-idp:us-east-1:131049698002:userpool/us-east-1_kcpcLxLzn'])
"""
# Home page
http http://localhost:8000/forms/ "Authorization: allow"

# Get form
http http://localhost:8000/forms/e4548443-99da-4340-b825-3f09921b4bc5 "Authorization: allow"

http https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/forms/ "Authorization: allow"
"""

# app.route('/centers', methods=['GET', 'POST'], cors=True, authorizer=iamAuthorizer)(routes.center_list)
# app.route('/centers/{centerId}/forms', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_list)
# app.route('/centers/{centerId}/schemas', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.schema_list)
app.route('/forms', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_list)
app.route('/forms', methods=['POST'], cors=True, authorizer=iamAuthorizer, content_types=['application/x-www-form-urlencoded'])(routes.form_create)
app.route('/forms/{formId}', methods=['DELETE'], cors=True, authorizer=iamAuthorizer)(routes.form_delete)
app.route('/forms/{formId}', methods=['PATCH'], cors=True, authorizer=iamAuthorizer)(routes.form_edit)
app.route('/forms/{formId}/responses', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_response_list)
# form response edit
app.route('/forms/{formId}/responsesExport', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_response_export)
app.route('/forms/{formId}/summary', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_response_summary)
app.route('/responses/{responseId}', methods=['PATCH'], cors=True, authorizer=iamAuthorizer)(routes.response_edit)
app.route('/responses/{responseId}/checkin', methods=['POST'], cors=True, authorizer=iamAuthorizer)(routes.response_checkin)
app.route('/forms/{formId}/permissions', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.form_get_permissions)
app.route('/forms/{formId}/permissions', methods=['POST'], cors=True, authorizer=iamAuthorizer)(routes.form_edit_permissions)

app.route('/forms/{formId}', methods=['GET'], cors=True)(routes.form_render)
app.route('/forms/{formId}', methods=['POST'], cors=True)(routes.form_response_new)
# todo: fix this:
app.route('/responses/{responseId}/ipn', methods=['POST'], cors=True, content_types=['application/x-www-form-urlencoded'])(routes.response_ipn_listener)
app.route('/responses/{responseId}/ccavenueResponseHandler', methods=['POST'], cors=True, content_types=['application/x-www-form-urlencoded'])(routes.response_ccavenue_response_handler)
app.route('/responses/{responseId}/sendConfirmationEmail', methods=['POST'], cors=True)(routes.response_send_confirmation_email)

app.route('/responses/{responseId}', methods=['GET'], cors=True, authorizer=iamAuthorizer)(routes.response_view)