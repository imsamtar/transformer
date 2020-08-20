export default {
    // Google sign-in (Firebase web app credentials)
    firebaseConfig: {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        databaseURL: "https://YOUR_PROJECT.firebaseio.com",
        projectId: "YOUR_PROJECT",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID",
        measurementId: "YOUR_MEASUREMENT_ID"
    },
    // Hasura GraphQL endpoint of the backend that stores users, projects and pseudo blocks
    endpoint: "https://YOUR_HASURA_APP/v1/graphql",
    schema: "transformer",
    queries: {
        insertUser: `mutation MyMutation($username: String, $email: String) {
            insert_%s_user(objects: {username: $username, email: $email}) {
                affected_rows
            }
        }`,
        searchProject: `query searchProjects($search: String!) {
            %s_project(where: {project_name: {_ilike: $search}}) {
                project_id
                project_name
                endpoint
                admin_secret
                admin
                schemas {
                    schema_id
                    schema_name
                }
            }
        }`,
        createProject: `mutation createProject($project_name: String!, $endpoint:String!, $admin_secret: String) {
            insert_%s_project(objects: {project_name: $project_name, endpoint: $endpoint, admin_secret: $admin_secret}) {
                affected_rows
            }
        }`,
        createSchema: `mutation createSchema($schema_name: String!, $project_id: Int) {
            insert_%s_schema(objects: {schema_name: $schema_name, project_id: $project_id}) {
                affected_rows
            }
        }`,
        deleteProject: `mutation deleteProject($project_id: Int!) {
            delete_%s_schema(where: {project_id: {_eq: $project_id}}){
                affected_rows
            }
            delete_%s_works(where: {project_id: {_eq: $project_id}}){
                affected_rows
            }
            delete_%s_project(where: {project_id: {_eq: $project_id}}) {
                affected_rows
            }
        }`,
        deleteSchema: `mutation deleteSchema($schema_id: Int!) {
            delete_%s_schema(where: {schema_id: {_eq: $schema_id}}) {
                affected_rows
            }
        }`,
        getASchema: `
            query getASchema($id: Int!) {
                transformer_schema_by_pk(schema_id: $id) {
                    schema_id
                    project_id
                    schema_name
                    project {
                        endpoint
                        admin_secret
                        schemas {
                            schema_name
                        }
                        pseudo_blocks {
                            block_id
                            type
                            text
                        }
                    }
                }
            }
        `,
        newBlock: `
            mutation newBlock($type: String!, $project_id: Int!, $data: jsonb!) {
                insert_transformer_pseudo_block_one(object: {type: $type, project_id: $project_id, text: $data}) {
                    block_id
                    type
                    text
                }
            }
        `
    }
};
