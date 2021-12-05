import useRequest from '../../hooks/use-request';

const TicketShow = ({ ticket }) => {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id
        },
        onSuccess: (order) => {
            console.log('### succcess submitting new order', ticket.id);
            console.log(order);
        }
    });

    const orderTicket = async () => {
        await doRequest();
    };

    return (
        <div>
            <h1>{ ticket.title }</h1>
            <h3>Price: { ticket.price }</h3>
            { errors }
            <buton onClick={orderTicket} className="btn btn-primary">
                Purchase
            </buton>
        </div>
    );
};

TicketShow.getInitialProps = async (context, client) => {
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);
    return { ticket: data };
};

export default TicketShow;