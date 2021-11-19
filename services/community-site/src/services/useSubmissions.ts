import { useState, useEffect } from 'react';
import useApi from './useApi';
import { useAuth } from './useAuth';

const useSubmissions = () => {
  const auth = useAuth();
  const api = useApi();

  const [points, setPoints] = useState(0);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [review, setReview] = useState([]);

  const getSubmissions = async () => {
    if (!auth.user || !auth.user.id) {
      return;
    }

    const data = await api.get(`/submissions?user.id=${auth.user!.id}`);
    if (!data.success) {
      return;
    }

    setApproved(
      data.response.filter(
        (sub: { reviewed: boolean; accepted: boolean }) =>
          sub.reviewed === true && sub.accepted === true,
      ),
    );
    setRejected(
      data.response.filter(
        (sub: { reviewed: boolean; accepted: boolean }) =>
          sub.reviewed === true && sub.accepted === false,
      ),
    );
    setReview(
      data.response.filter(
        (sub: { reviewed: boolean | null }) => sub.reviewed === null || sub.reviewed === false,
      ),
    );
  };

  useEffect(() => {
    getSubmissions();
  }, [auth.user]);

  useEffect(() => {
    const p = approved.reduce((tot, submission: any) => {
      return tot + parseFloat(submission.submission_reward);
    }, 0);

    setPoints(p);
  }, [approved]);

  return { points, approved, rejected, review };
};

export default useSubmissions;
