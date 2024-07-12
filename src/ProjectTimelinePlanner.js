import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { X, Link as LinkIcon, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/ui/dialog";

const ProjectTimelinePlanner = () => {
  const [timeframe, setTimeframe] = useState(18);
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ name: '', bestCase: 1, worstCase: 2, link: '' });
  const [editingTicket, setEditingTicket] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  const addTicket = () => {
    if (newTicket.name && newTicket.bestCase > 0 && newTicket.worstCase >= newTicket.bestCase) {
      setTickets([...tickets, { ...newTicket, color: colors[tickets.length % colors.length], id: Date.now() }]);
      setNewTicket({ name: '', bestCase: 1, worstCase: 2, link: '' });
    }
  };

  const deleteTicket = (id) => {
    setTickets(tickets.filter(ticket => ticket.id !== id));
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingTicket(null);
    setIsEditModalOpen(false);
  };

  const saveEditedTicket = () => {
    setTickets(tickets.map(ticket => 
      ticket.id === editingTicket.id ? editingTicket : ticket
    ));
    closeEditModal();
  };

  const calculateRemaining = () => {
    const totalBest = tickets.reduce((sum, ticket) => sum + ticket.bestCase, 0);
    const totalWorst = tickets.reduce((sum, ticket) => sum + ticket.worstCase, 0);
    return {
      bestCase: timeframe - totalBest,
      worstCase: timeframe - totalWorst,
    };
  };

  const remaining = calculateRemaining();

  const Timeline = () => {
    const totalWidth = 100;
    const totalTime = Math.max(timeframe, tickets.reduce((sum, ticket) => sum + ticket.worstCase, 0));

    return (
      <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden flex">
        {tickets.map((ticket) => {
          const bestWidth = (ticket.bestCase / totalTime) * totalWidth;
          const worstWidth = (ticket.worstCase / totalTime) * totalWidth;
          return (
            <div key={ticket.id} className="h-full flex" style={{ width: `${worstWidth}%` }}>
              <div className={`${ticket.color} h-full`} style={{ width: `${(bestWidth / worstWidth) * 100}%` }}></div>
              <div className={`${ticket.color} opacity-50 h-full flex-grow`}></div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen font-sans">
      <Card className="mb-8 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle>Project Timeline Planner</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center mb-6">
            <label htmlFor="timeframe" className="mr-2 text-sm text-gray-600">Timeframe:</label>
            <Input
              id="timeframe"
              type="number"
              value={timeframe}
              onChange={(e) => setTimeframe(parseInt(e.target.value) || 0)}
              className="w-20 mr-2"
            />
            <span className="text-sm text-gray-600">days</span>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Ticket name"
              value={newTicket.name}
              onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
              className="col-span-2"
            />
            <Input
              type="number"
              placeholder="Best case"
              value={newTicket.bestCase}
              onChange={(e) => setNewTicket({ ...newTicket, bestCase: parseInt(e.target.value) || 0 })}
            />
            <Input
              type="number"
              placeholder="Worst case"
              value={newTicket.worstCase}
              onChange={(e) => setNewTicket({ ...newTicket, worstCase: parseInt(e.target.value) || 0 })}
            />
          </div>
          <Button onClick={addTicket} className="mb-6 w-full bg-gray-700 hover:bg-gray-800 text-white">
            Add Ticket
          </Button>
          <div className="mb-6">
            <h3 className="text-lg font-light mb-2 text-gray-700">Timeline</h3>
            <Timeline />
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-light mb-2 text-gray-700">Days Remaining</h3>
            <div className="flex justify-between text-2xl font-light">
              <div>
                Best Case: <span className={`font-normal ${remaining.bestCase >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {remaining.bestCase} days
                </span>
              </div>
              <div>
                Worst Case: <span className={`font-normal ${remaining.worstCase >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {remaining.worstCase} days
                </span>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-light mb-2 text-gray-700">Tickets</h3>
            <ul className="space-y-2">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="flex justify-between items-center py-2 border-b border-gray-200 text-sm">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${ticket.color} mr-2`}></div>
                    <span className="font-medium text-gray-700">{ticket.name}</span>
                    {ticket.link && (
                      <a href={ticket.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                        <LinkIcon size={16} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-4">
                      Best: {ticket.bestCase} {ticket.bestCase === 1 ? 'day' : 'days'}, 
                      Worst: {ticket.worstCase} {ticket.worstCase === 1 ? 'day' : 'days'}
                    </span>
                    <Button onClick={() => openEditModal(ticket)} variant="ghost" size="sm" className="mr-2">
                      <Edit size={16} />
                    </Button>
                    <Button onClick={() => deleteTicket(ticket.id)} variant="ghost" size="sm">
                      <X size={16} />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Ticket</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">Name</label>
              <Input
                id="name"
                value={editingTicket?.name || ''}
                onChange={(e) => setEditingTicket({ ...editingTicket, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="bestCase" className="text-right">Best Case</label>
              <Input
                id="bestCase"
                type="number"
                value={editingTicket?.bestCase || 0}
                onChange={(e) => setEditingTicket({ ...editingTicket, bestCase: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="worstCase" className="text-right">Worst Case</label>
              <Input
                id="worstCase"
                type="number"
                value={editingTicket?.worstCase || 0}
                onChange={(e) => setEditingTicket({ ...editingTicket, worstCase: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="link" className="text-right">Link</label>
              <Input
                id="link"
                value={editingTicket?.link || ''}
                onChange={(e) => setEditingTicket({ ...editingTicket, link: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeEditModal} variant="outline">Cancel</Button>
            <Button onClick={saveEditedTicket}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectTimelinePlanner;