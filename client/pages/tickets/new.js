import { useState } from 'react';
import useRequest from '../../hooks/use-request';

const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title, price
        },
        onSuccess: (ticket) => {
            console.log('### succcess submitting new ticket', title, price);
            console.log(ticket);
        }
    });

    const onBlurPrice = () => {
        const newPrice = parseFloat(price);
        if (isNaN(newPrice)) {
            return;
        }
        setPrice(newPrice.toFixed(2));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        await doRequest();
    };

    return (
        <div>
            <h1>Create a Ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input
                        value={price}
                        onBlur={onBlurPrice}
                        onChange={e => setPrice(e.target.value)}
                        className="form-control"
                    />
                </div>
                { errors }
                <button className="btn btn-primary">Submit</button>
            </form>
        </div>
    )
};

export default NewTicket;
