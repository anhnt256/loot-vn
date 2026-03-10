const { sendAppointmentReminders } = require('../lib/game-appointment-notifications');

async function runReminderJob() {
  try {
    console.log('🕐 Starting appointment reminder job...');
    
    await sendAppointmentReminders();
    
    console.log('✅ Appointment reminder job completed successfully');
    
  } catch (error) {
    console.error('❌ Error in appointment reminder job:', error);
    throw error;
  }
}

// Run the reminder job
if (require.main === module) {
  runReminderJob()
    .then(() => {
      console.log('✅ Reminder job completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Reminder job failed:', error);
      process.exit(1);
    });
}

module.exports = { runReminderJob };
