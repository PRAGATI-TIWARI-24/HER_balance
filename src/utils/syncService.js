import { supabase } from '../supabaseClient';

export const syncGuestDataToSupabase = async (user) => {
  if (!user || !user.id) return;

  try {
    // 1. Check local assessment test results
    const localAssessment = localStorage.getItem('hb_last_test_result');
    if (localAssessment) {
      const parsedData = JSON.parse(localAssessment);

      // user_health_data table me upsert karein
      const { error: healthError } = await supabase
        .from('user_health_data')
        .upsert({
          user_id: user.id,
          symptom_status: parsedData.risk_level || 'Stable',
          cycle_length: parsedData.cycle_length || 28,
          last_date: parsedData.last_date || new Date().toISOString().split('T')[0],
          lab_values: parsedData.features || {},
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (!healthError) {
        // Migration complete hone ke baad local temporary flag update karein
        localStorage.removeItem('hb_last_test_result');
      }
    }

    // 2. Check local daily tracking logs
    const localDailyLogs = localStorage.getItem('hb_offline_daily_logs');
    if (localDailyLogs) {
      const parsedLogs = JSON.parse(localDailyLogs);
      if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
        const payload = parsedLogs.map(log => ({
          user_id: user.id,
          log_date: log.date || new Date().toISOString().split('T')[0],
          water_count: log.water || 0,
          exercise_mins: log.exercise || 0,
          logged_sleep: log.sleep || 0,
          symptoms: log.symptoms || [],
          medications: log.medications || []
        }));

        const { error: logsError } = await supabase
          .from('daily_health_logs')
          .upsert(payload, { onConflict: 'user_id,log_date' });

        if (!logsError) {
          localStorage.removeItem('hb_offline_daily_logs');
        }
      }
    }
  } catch (err) {
    console.error('Data migration error during login:', err);
  }
};