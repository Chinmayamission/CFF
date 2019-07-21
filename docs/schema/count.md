You can give a numeric counter to each response as it gets added to the form. This is useful to create a "human-readable" numeric id that people can then see in their confirmation email and use to look responses up.

To do this, in `formOptions` add:
```
"counter": {
    "enabled": true
}
```

Then, the `counter` field on the response will be incremented, starting with 1 for the first response, etc.

**Note:** the numbers are only assigned once upon response creation. If a response is deleted, then that number will be skipped.

**Note:** Enabling the count may significantly slow down database insertion time

> Depending on replication lag and time to flush the counter document to disk, this technique will limit the speed of unique identifier generation. If we assume that it takes 25ms for the counter document to be persisted and replicated to the database then this method would only be able to generate 40 new unique identifiers per second. If the application is waiting for unique identifier values before new documents can be inserted into a given collection, then these inserts will have a maximum write speed of 40 documents per second. Without such a bottleneck, we would expect a well functioning database to be able to write tens of thousands of documents per second.
(From [https://www.mongodb.com/blog/post/generating-globally-unique-identifiers-for-use-with-mongodb](Generating Globally Unique Identifiers for Use with MongoDBs))

## Adding a counter to the response table
To add the counter to the response table, enter `COUNTER` in the header value and it will be added.

**Todo:** functionality to look responses up by counter, such as in the "check-in" functionality.