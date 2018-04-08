import boto3
from boto3.dynamodb.conditions import Key
from chalice import Chalice, AuthResponse, CognitoUserPoolAuthorizer, IAMAuthorizer, UnauthorizedError
from chalicelib.aggregate import aggregate_data
import datetime
import json
import os
import re
DYNAMODB_RESERVED_KEYWORDS = ("ABORT","ABSOLUTE","ACTION","ADD","AFTER","AGENT","AGGREGATE","ALL","ALLOCATE","ALTER","ANALYZE","AND","ANY","ARCHIVE","ARE","ARRAY","AS","ASC","ASCII","ASENSITIVE","ASSERTION","ASYMMETRIC","AT","ATOMIC","ATTACH","ATTRIBUTE","AUTH","AUTHORIZATION","AUTHORIZE","AUTO","AVG","BACK","BACKUP","BASE","BATCH","BEFORE","BEGIN","BETWEEN","BIGINT","BINARY","BIT","BLOB","BLOCK","BOOLEAN","BOTH","BREADTH","BUCKET","BULK","BY","BYTE","CALL","CALLED","CALLING","CAPACITY","CASCADE","CASCADED","CASE","CAST","CATALOG","CHAR","CHARACTER","CHECK","CLASS","CLOB","CLOSE","CLUSTER","CLUSTERED","CLUSTERING","CLUSTERS","COALESCE","COLLATE","COLLATION","COLLECTION","COLUMN","COLUMNS","COMBINE","COMMENT","COMMIT","COMPACT","COMPILE","COMPRESS","CONDITION","CONFLICT","CONNECT","CONNECTION","CONSISTENCY","CONSISTENT","CONSTRAINT","CONSTRAINTS","CONSTRUCTOR","CONSUMED","CONTINUE","CONVERT","COPY","CORRESPONDING","COUNT","COUNTER","CREATE","CROSS","CUBE","CURRENT","CURSOR","CYCLE","DATA","DATABASE","DATE","DATETIME","DAY","DEALLOCATE","DEC","DECIMAL","DECLARE","DEFAULT","DEFERRABLE","DEFERRED","DEFINE","DEFINED","DEFINITION","DELETE","DELIMITED","DEPTH","DEREF","DESC","DESCRIBE","DESCRIPTOR","DETACH","DETERMINISTIC","DIAGNOSTICS","DIRECTORIES","DISABLE","DISCONNECT","DISTINCT","DISTRIBUTE","DO","DOMAIN","DOUBLE","DROP","DUMP","DURATION","DYNAMIC","EACH","ELEMENT","ELSE","ELSEIF","EMPTY","ENABLE","END","EQUAL","EQUALS","ERROR","ESCAPE","ESCAPED","EVAL","EVALUATE","EXCEEDED","EXCEPT","EXCEPTION","EXCEPTIONS","EXCLUSIVE","EXEC","EXECUTE","EXISTS","EXIT","EXPLAIN","EXPLODE","EXPORT","EXPRESSION","EXTENDED","EXTERNAL","EXTRACT","FAIL","FALSE","FAMILY","FETCH","FIELDS","FILE","FILTER","FILTERING","FINAL","FINISH","FIRST","FIXED","FLATTERN","FLOAT","FOR","FORCE","FOREIGN","FORMAT","FORWARD","FOUND","FREE","FROM","FULL","FUNCTION","FUNCTIONS","GENERAL","GENERATE","GET","GLOB","GLOBAL","GO","GOTO","GRANT","GREATER","GROUP","GROUPING","HANDLER","HASH","HAVE","HAVING","HEAP","HIDDEN","HOLD","HOUR","IDENTIFIED","IDENTITY","IF","IGNORE","IMMEDIATE","IMPORT","IN","INCLUDING","INCLUSIVE","INCREMENT","INCREMENTAL","INDEX","INDEXED","INDEXES","INDICATOR","INFINITE","INITIALLY","INLINE","INNER","INNTER","INOUT","INPUT","INSENSITIVE","INSERT","INSTEAD","INT","INTEGER","INTERSECT","INTERVAL","INTO","INVALIDATE","IS","ISOLATION","ITEM","ITEMS","ITERATE","JOIN","KEY","KEYS","LAG","LANGUAGE","LARGE","LAST","LATERAL","LEAD","LEADING","LEAVE","LEFT","LENGTH","LESS","LEVEL","LIKE","LIMIT","LIMITED","LINES","LIST","LOAD","LOCAL","LOCALTIME","LOCALTIMESTAMP","LOCATION","LOCATOR","LOCK","LOCKS","LOG","LOGED","LONG","LOOP","LOWER","MAP","MATCH","MATERIALIZED","MAX","MAXLEN","MEMBER","MERGE","METHOD","METRICS","MIN","MINUS","MINUTE","MISSING","MOD","MODE","MODIFIES","MODIFY","MODULE","MONTH","MULTI","MULTISET","NAME","NAMES","NATIONAL","NATURAL","NCHAR","NCLOB","NEW","NEXT","NO","NONE","NOT","NULL","NULLIF","NUMBER","NUMERIC","OBJECT","OF","OFFLINE","OFFSET","OLD","ON","ONLINE","ONLY","OPAQUE","OPEN","OPERATOR","OPTION","OR","ORDER","ORDINALITY","OTHER","OTHERS","OUT","OUTER","OUTPUT","OVER","OVERLAPS","OVERRIDE","OWNER","PAD","PARALLEL","PARAMETER","PARAMETERS","PARTIAL","PARTITION","PARTITIONED","PARTITIONS","PATH","PERCENT","PERCENTILE","PERMISSION","PERMISSIONS","PIPE","PIPELINED","PLAN","POOL","POSITION","PRECISION","PREPARE","PRESERVE","PRIMARY","PRIOR","PRIVATE","PRIVILEGES","PROCEDURE","PROCESSED","PROJECT","PROJECTION","PROPERTY","PROVISIONING","PUBLIC","PUT","QUERY","QUIT","QUORUM","RAISE","RANDOM","RANGE","RANK","RAW","READ","READS","REAL","REBUILD","RECORD","RECURSIVE","REDUCE","REF","REFERENCE","REFERENCES","REFERENCING","REGEXP","REGION","REINDEX","RELATIVE","RELEASE","REMAINDER","RENAME","REPEAT","REPLACE","REQUEST","RESET","RESIGNAL","RESOURCE","RESPONSE","RESTORE","RESTRICT","RESULT","RETURN","RETURNING","RETURNS","REVERSE","REVOKE","RIGHT","ROLE","ROLES","ROLLBACK","ROLLUP","ROUTINE","ROW","ROWS","RULE","RULES","SAMPLE","SATISFIES","SAVE","SAVEPOINT","SCAN","SCHEMA","SCOPE","SCROLL","SEARCH","SECOND","SECTION","SEGMENT","SEGMENTS","SELECT","SELF","SEMI","SENSITIVE","SEPARATE","SEQUENCE","SERIALIZABLE","SESSION","SET","SETS","SHARD","SHARE","SHARED","SHORT","SHOW","SIGNAL","SIMILAR","SIZE","SKEWED","SMALLINT","SNAPSHOT","SOME","SOURCE","SPACE","SPACES","SPARSE","SPECIFIC","SPECIFICTYPE","SPLIT","SQL","SQLCODE","SQLERROR","SQLEXCEPTION","SQLSTATE","SQLWARNING","START","STATE","STATIC","STATUS","STORAGE","STORE","STORED","STREAM","STRING","STRUCT","STYLE","SUB","SUBMULTISET","SUBPARTITION","SUBSTRING","SUBTYPE","SUM","SUPER","SYMMETRIC","SYNONYM","SYSTEM","TABLE","TABLESAMPLE","TEMP","TEMPORARY","TERMINATED","TEXT","THAN","THEN","THROUGHPUT","TIME","TIMESTAMP","TIMEZONE","TINYINT","TO","TOKEN","TOTAL","TOUCH","TRAILING","TRANSACTION","TRANSFORM","TRANSLATE","TRANSLATION","TREAT","TRIGGER","TRIM","TRUE","TRUNCATE","TTL","TUPLE","TYPE","UNDER","UNDO","UNION","UNIQUE","UNIT","UNKNOWN","UNLOGGED","UNNEST","UNPROCESSED","UNSIGNED","UNTIL","UPDATE","UPPER","URL","USAGE","USE","USER","USERS","USING","UUID","VACUUM","VALUE","VALUED","VALUES","VARCHAR","VARIABLE","VARIANCE","VARINT","VARYING","VIEW","VIEWS","VIRTUAL","VOID","WAIT","WHEN","WHENEVER","WHERE","WHILE","WINDOW","WITH","WITHIN","WITHOUT","WORK","WRAPPED","WRITE","YEAR","ZONE")

def get_table_name(name):
    if name in ["responses", "schemaModifiers", "schemas", "forms", "centers", "centres", "users"]:
        return "{}.{}".format(os.getenv("TABLE_PREFIX"), name)
    else:
        return name

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
class TABLES_CLASS:
    responses = dynamodb.Table(get_table_name("responses"))
    forms = dynamodb.Table(get_table_name("forms"))
    schemas = dynamodb.Table(get_table_name("schemas"))
    schemaModifiers = dynamodb.Table(get_table_name("schemaModifiers"))
    centers = dynamodb.Table(get_table_name("centres"))
    users = dynamodb.Table(get_table_name("users"))
TABLES = TABLES_CLASS()

class CustomChalice(Chalice):
    def get_current_user_id(self):
        return "cff:cognitoIdentityId:{}".format(self.current_request.context['identity']['cognitoIdentityId'])
    def check_permissions(self, model, action):
        id = self.get_current_user_id()
        cff_permissions = model.get("cff_permissions", {})
        if id in cff_permissions.get(action, []) or id in cff_permissions.get("owner", []):
            return True
        else:
            raise UnauthorizedError("User {} is not authorized to perform action {}".format(id, action))

app = CustomChalice(app_name='ccmt-cff-rest-api')
# app = Chalice(app_name='ccmt-cff-rest-api')
app.debug = True

iamAuthorizer = IAMAuthorizer()

"""
# Home page
http http://localhost:8000/forms/ "Authorization: allow"

# Get form
http http://localhost:8000/forms/e4548443-99da-4340-b825-3f09921b4bc5 "Authorization: allow"

http https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/forms/ "Authorization: allow"
"""

@app.route('/centers', cors=True, authorizer=iamAuthorizer)
def center_list():
    userId = app.get_current_user_id()
    # user = User.get(id=userId)
    user = TABLES.users.get_item(
        Key=dict(id=userId)
    )
    if not "Item" in user:
        # User(id=userId, date_created = datetime.datetime.now()).save() todo: this doesn't work with datetime.
        TABLES.users.put_item(
			Item=dict(id=userId)
		)
        # User(id=userId).save()
        raise UnauthorizedError("User is not set up yet.")
    user = user["Item"]
    if not 'centers' in user or not user['centers']:
        raise UnauthorizedError("No centers found for this user.")
    # todo: change this to a batch get.
    centers = [TABLES.centers.get_item(Key=dict(id=centerId))["Item"] for centerId in user['centers']]
    return {"res": centers}

@app.route('/centers/{centerId}/forms', cors=True, authorizer=iamAuthorizer)
def form_list(centerId):
    # app.check_permissions('forms', 'ListForms')
    forms = TABLES.forms.query(
        IndexName='center-index',
        KeyConditionExpression=Key('center').eq(int(centerId))
    )["Items"]
    return {"res": forms}
    # forms = Form.get(id="e4548443-99da-4340-b825-3f09921b4bc5", version=1).to_dict()
    # return {'current_request': app.current_request.to_dict(), "forms": forms}

@app.route('/forms/{formId}/render', cors=True, authorizer=iamAuthorizer)
def form_render(formId):
    """Renders schema and schemaModifier. Todo: also modify schema server-side and return just schema & uiSchema."""
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        ProjectionExpression="#name, id, version, date_created, date_last_modified, #schema, schemaModifier",
        ExpressionAttributeNames={"#name": "name", "#schema": "schema"}
    )["Item"]
    form["schema"] = TABLES.schemas.get_item(
        Key=form["schema"]
    )["Item"]
    form["schemaModifier"] = TABLES.schemaModifiers.get_item(
        Key=form["schemaModifier"]
    )["Item"]
    return {'res': form }

@app.route('/forms/{formId}/responses', cors=True, authorizer=iamAuthorizer)
def form_response_list(formId):
    """Show all responses for a particular form."""
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1)
    )["Item"]
    app.check_permissions(form, "ViewResponses")
    responses = TABLES.responses.query(
        KeyConditionExpression=Key('formId').eq(formId)
    )["Items"]
    # responses = [r.to_dict() for r in Response.query(formId=formId)]
    return {'res': responses }# Form.get("e4548443-99da-4340-b825-3f09921b4bc5", 1)}

@app.route('/forms/{formId}/summary', cors=True, authorizer=iamAuthorizer)
def form_response_summary(formId):
    """Show response agg. summary"""
    # form = Form.get(id=formId, version=1)
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        ProjectionExpression="schemaModifier, cff_permissions"
    )["Item"]
    app.check_permissions(form, "ViewResponseSummary")
    dataOptions = TABLES.schemaModifiers.get_item(
        Key=form["schemaModifier"],
        ProjectionExpression="dataOptions"
    )["Item"].get("dataOptions", {})
    responses = TABLES.responses.query(
        KeyConditionExpression=Key('formId').eq(formId),
        FilterExpression=Key('PAID').eq(True)
    )["Items"]
    result = aggregate_data(dataOptions, responses)
    return {"res": result}

@app.route('/forms/{formId}/responses/{responseId}/edit', methods=['POST'], cors=True, authorizer=iamAuthorizer)
def edit_response(formId, responseId):
    """Edit an individual response from the admin dashboard.
    """
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        ProjectionExpression="cff_permissions"
    )["Item"]
    app.check_permissions(form, "ResponsesEdit")
    path = app.current_request.json_body["path"]
    value = app.current_request.json_body["value"]
    # Todo: make sure path is not one of the reserved keywords, by using expressionattributenames.
    # Todo: replace spaces in path, only letters & dots allowed.
    path = path.replace(" ", "")
    pathNames = path.split(".")
    expressionAttributeNames = {}
    escapedPath = ""
    for pathName in pathNames:
        if not pathName:
            continue
        if escapedPath != "":
            escapedPath += "."
        if pathName.isdigit():
            escapedPath += pathName
        else:
            pathName_escaped = "#cff{}".format(pathName)
            expressionAttributeNames[pathName_escaped] = pathName
            escapedPath += pathName_escaped
    # Converts a.2.3.asd.dsgdf.34.6 to a[2][3].asd.dsgdf[34][6]
    escapedPath = re.sub(r'\.(\d+)', lambda x: "[{}]".format(x.group(1)), escapedPath)
    # raise Exception("{}, {}".format(path, expressionAttributeNames))
    result = TABLES.responses.update_item(
        Key=dict(formId=formId, responseId=responseId),
        UpdateExpression= "SET {} = :value,"
            "UPDATE_HISTORY = list_append(if_not_exists(UPDATE_HISTORY, :empty_list), :updateHistory),"
            "date_last_modified = :now".format(escapedPath),
        ExpressionAttributeValues={
            ":value": value,
            ":now": datetime.datetime.now().isoformat(),
            ':updateHistory': [{
                "date": datetime.datetime.now().isoformat(),
                "action": "admin_update_ResponsesEdit",
                "author": app.get_current_user_id(),
                "path": path,
                "value": value
            }],
            ":empty_list": []
        },
        ExpressionAttributeNames=expressionAttributeNames,
        ReturnValues="UPDATED_NEW"
    )["Attributes"]
    return {"res": result, "success": True, "action": "update"}
    # todo: return a better, more uniform response.

@app.route('/forms/{formId}/responses/{responseId}/view', cors=True, authorizer=iamAuthorizer)
def view_response(formId, responseId):
    """View an individual response from the admin dashboard (for search functionality).
    """
    form = TABLES.forms.get_item(
        Key=dict(id=formId, version=1),
        ProjectionExpression="cff_permissions"
    )["Item"]
    app.check_permissions(form, "ResponsesView")
    response = TABLES.responses.get_item(
        Key=dict(formId=formId, responseId=responseId)
    )["Item"]
    return {"success": True, "res": response}