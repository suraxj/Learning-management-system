const cron = require('node-cron');
const Borrow = require('../models/Borrow');
const Notification = require('../models/Notification');
const sendEmail = require('../config/mailer');
const startOverdueJob = () => {
  cron.schedule('0 9 * * *', async () => {
    const overdue = await Borrow.find({ status: 'borrowed', dueDate: { $lt: new Date() } }).populate('user book');
    for (const item of overdue) {
      item.status = 'overdue'; await item.save();
      await Notification.create({ user: item.user._id, title: 'Book overdue', message: `${item.book.title} is overdue. Please return it soon.`, type: 'overdue' });
      await sendEmail({ to: item.user.email, subject: 'Overdue book reminder', html: `<p>Your borrowed book <b>${item.book.title}</b> is overdue.</p>` });
    }
  });
};
module.exports = startOverdueJob;
