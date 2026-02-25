import { useState, useRef, useEffect } from 'react';
import type { Board, BoardMember, User } from '../../types/index.js';
import { boardMembersApi } from '../../api/boardMembers.js';

interface ShareBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
}

export default function ShareBoardModal({ isOpen, onClose, board }: ShareBoardModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = board.role === 'owner' || board.role === 'admin';

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      loadMembers();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    try {
      const data = await boardMembersApi.getMembers(board._id);
      setOwner(data.owner);
      setMembers(data.members);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const handleInvite = async () => {
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const member = await boardMembersApi.invite(board._id, { email: email.trim(), role });
      setMembers((prev) => [...prev, member]);
      setEmail('');
      setRole('member');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      const updated = await boardMembersApi.updateRole(board._id, memberId, { role: newRole });
      setMembers((prev) => prev.map((m) => (m._id === memberId ? updated : m)));
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      await boardMembersApi.remove(board._id, memberId);
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box max-w-md">
        <h3 className="text-lg font-bold">Share Board</h3>

        {/* Invite section — owner/admin only */}
        {canManage && (
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                type="email"
                className="input input-bordered input-sm flex-1"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
              <select
                className="select select-bordered select-sm w-28"
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleInvite}
                disabled={!email.trim() || loading}
              >
                {loading ? <span className="loading loading-spinner loading-xs" /> : 'Invite'}
              </button>
            </div>
            {error && <p className="text-error text-xs mt-1">{error}</p>}
          </div>
        )}

        {/* Member list */}
        <div className="mt-4 space-y-2">
          {/* Owner */}
          {owner && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-base-200">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                {getInitial(owner.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{owner.name}</p>
                <p className="text-xs text-base-content/50 truncate">{owner.email}</p>
              </div>
              <span className="badge badge-sm">Owner</span>
            </div>
          )}

          {/* Members */}
          {members.map((member) => {
            const user = member.userId;
            return (
              <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg bg-base-200">
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center text-sm font-bold">
                  {getInitial(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-base-content/50 truncate">{user.email}</p>
                </div>
                {canManage ? (
                  <select
                    className="select select-bordered select-xs w-24"
                    value={member.role}
                    onChange={(e) => handleRoleChange(member._id, e.target.value as 'admin' | 'member')}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className="badge badge-sm badge-ghost">
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                )}
                {canManage && (
                  <button
                    className="btn btn-ghost btn-xs btn-circle text-error"
                    onClick={() => handleRemove(member._id)}
                    title="Remove member"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}

          {members.length === 0 && (
            <p className="text-sm text-base-content/40 text-center py-4">
              No members yet. Invite someone to collaborate!
            </p>
          )}
        </div>

        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-ghost btn-sm" type="submit">Close</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}
