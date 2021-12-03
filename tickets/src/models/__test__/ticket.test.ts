import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
    const ticket = Ticket.build({
        title: 'EXO concert',
        price: 1000,
        userId: '123abc'
    });
    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance!.set({ price: 2000 });
    secondInstance!.set({ price: 5000 });

    await firstInstance!.save();

    try {
        await secondInstance!.save();
    } catch (err) {
        // secondInstance.save() SHOULD fail and throw an error.
        // so it is desirable to reach this catch block
        return;
    }

    // if it reaches this point, it means failed to catch
    // an error in the process of secondInstance.save() above
    throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'EXO concert',
        price: 1000,
        userId: '123abc'
    });
    
    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});
