const Index = ({ currentUser }) => {
    return currentUser ? <h1>You are signed in!</h1> : <h1>You are not signed in :(</h1>;
};

Index.getInitialProps = async (context, client, currentUser) => {
    return {};
};

export default Index;
