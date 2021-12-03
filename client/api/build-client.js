import axios from 'axios';

const buildClient = ({ req }) => {
    const onServerEnvironment = typeof window === 'undefined';
    console.log('ON BUILD CLIENT');
    if (onServerEnvironment) {
        console.log('### ON SERVER ENV');
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    } else {
        console.log('### ON CLIENT ENV');
        return axios.create({
            baseURL: '/'
        });
    }
};

export default buildClient;
