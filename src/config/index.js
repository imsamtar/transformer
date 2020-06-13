export default {
    firebaseConfig: {},
    server: "",
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
        }`
    }
};
