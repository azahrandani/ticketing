import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';

const OrderShow = ({ order, currentUser }) => {
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
            <StripeCheckout
                token={(token) => console.log(token)}
                stripeKey="pk_test_51K317dFWfZOD1YVnROKElAij50u5V00QHz8zxmiwhhzZeh06MLLawXFMmwyZMUx1c1QFDXc4AcgON6Es2xqWuY9p00Ck8VrDZK"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
        </div>
    )
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);
    return { order: data };
};

export default OrderShow;