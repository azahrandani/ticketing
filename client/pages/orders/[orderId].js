import { useEffect, useState } from 'react';

const OrderShow = ({ order }) => {
    const [timeLeft, setTimeLeft] = useState('');

    // like on mount function
    useEffect(() => {
        const findTimeLeft = () => {
            const milisecondsLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(milisecondsLeft / 1000));
        };

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        }
    }, []);

    return (
        <div>
            <h1>Order Show</h1>
            <p>{ timeLeft } seconds until order expires</p>
        </div>
    )
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data };
};

export default OrderShow;