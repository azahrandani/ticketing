import { useEffect, useState } from 'react';

const OrderShow = ({ order }) => {
    const [timeLeft, setTimeLeft] = useState(0);

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

    if (timeLeft < 0) {
        return (
            <div>
                <h1>Sorry, order has expired.</h1>
            </div>
        )
    }

    return (
        <div>
            <h1>Please make your payment</h1>
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