import { supabase, isSupabaseReady } from '../config/supabase';
import { getUserId } from '../utils/userId';
import { loadNickname } from '../utils/nickname';
import type { CharacterId, LeaderboardEntry } from '../types';

/** 점수 제출 */
export async function submitScore(
  profitRate: number,
  characterId: CharacterId,
  scenarioId: number,
): Promise<{ rank: number | null; error: string | null }> {
  if (!isSupabaseReady || !supabase) {
    return { rank: null, error: 'Supabase 미연결' };
  }

  const userId = getUserId();
  const nickname = loadNickname();

  try {
    // 점수 INSERT
    const { error: insertErr } = await supabase
      .from('daily_scores')
      .insert({
        user_id: userId,
        nickname,
        character_id: characterId,
        scenario_id: scenarioId,
        profit_rate: Math.round(profitRate * 100) / 100,
      });

    if (insertErr) {
      console.error('Score submit error:', insertErr);
      return { rank: null, error: insertErr.message };
    }

    // 내 랭킹 조회
    const { data, error: rpcErr } = await supabase
      .rpc('get_user_daily_best', { p_user_id: userId });

    if (rpcErr || !data || data.length === 0) {
      return { rank: null, error: null }; // 점수는 저장됨
    }

    return { rank: Number(data[0].rank), error: null };
  } catch (e) {
    console.error('Leaderboard error:', e);
    return { rank: null, error: '네트워크 오류' };
  }
}

/** 일간 Top 100 조회 */
export async function fetchDailyTop100(): Promise<{
  entries: LeaderboardEntry[];
  error: string | null;
}> {
  if (!isSupabaseReady || !supabase) {
    return { entries: [], error: 'Supabase 미연결' };
  }

  try {
    const { data, error } = await supabase
      .rpc('get_daily_top100');

    if (error) {
      console.error('Top100 fetch error:', error);
      return { entries: [], error: error.message };
    }

    const entries: LeaderboardEntry[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.rank),
      user_id: String(row.user_id),
      nickname: String(row.nickname),
      character_id: row.character_id as CharacterId,
      scenario_id: Number(row.scenario_id),
      profit_rate: Number(row.profit_rate),
      played_at: '',
      rank: Number(row.rank),
    }));

    return { entries, error: null };
  } catch (e) {
    console.error('Leaderboard fetch error:', e);
    return { entries: [], error: '네트워크 오류' };
  }
}

/** 내 일간 최고 순위 조회 */
export async function fetchMyRank(): Promise<{
  rank: number | null;
  profitRate: number | null;
  error: string | null;
}> {
  if (!isSupabaseReady || !supabase) {
    return { rank: null, profitRate: null, error: 'Supabase 미연결' };
  }

  const userId = getUserId();

  try {
    const { data, error } = await supabase
      .rpc('get_user_daily_best', { p_user_id: userId });

    if (error) {
      return { rank: null, profitRate: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { rank: null, profitRate: null, error: null };
    }

    return {
      rank: Number(data[0].rank),
      profitRate: Number(data[0].profit_rate),
      error: null,
    };
  } catch (e) {
    console.error('My rank fetch error:', e);
    return { rank: null, profitRate: null, error: '네트워크 오류' };
  }
}
