export default {
    firebaseConfig: {},
    server: "",
    queries: {
        insertUser: `mutation MyMutation($username: String, $email: String) {
            insert_transformer_user(objects: {username: $username, email: $email}) {
                affected_rows
            }
        }`
    }
};
