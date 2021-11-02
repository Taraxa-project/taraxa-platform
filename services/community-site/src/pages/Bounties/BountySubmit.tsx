import { useEffect, useState } from 'react';
import { useParams, Redirect } from 'react-router-dom';

import { SubmitCard } from '@taraxa_project/taraxa-ui';

import Title from '../../components/Title/Title';
import Markdown from '../../components/Markdown';

import { fileButtonLabel } from '../../global/globalVars';
import { useApi } from '../../services/useApi';

import { Bounty } from './bounty';

import './bounties.scss';

function BountySubmit() {
  let { id } = useParams<{ id: string }>();

  const api = useApi();

  const [bounty, setBounty] = useState<Partial<Bounty>>({});
  const [submitText, setSubmitText] = useState('');
  const [file, setFile] = useState();

  useEffect(() => {
    const getBounty = async (id: string) => {
      const data = await api.get(`/bounties/${id}`);
      if (!data.success) {
        return;
      }
      setBounty({
        ...data.response,
        active: data.response.state?.id === 1,
      });
    };
    getBounty(id);
  }, [id]);

  const submissionNeeded = bounty.text_submission_needed || bounty.file_submission_needed;

  if (bounty.id && !submissionNeeded) {
    return (<Redirect to={`/bounties/${bounty.id}`} />);
  }

  return (
    <div className="bounties">
      <div className="bounties-content">
        <Title
          title="Taraxa ecosystem bounties"
          subtitle="Earn rewards and help grow the Taraxa's ecosystem"
        />
        <SubmitCard
          title={bounty.name}
          description={(<Markdown>{bounty.submission}</Markdown>)}
          onClickText="Submit bounty"
          fileButtonLabel={fileButtonLabel}
          onClickButton={() => console.log('submited')}
          onFileChange={(e) => setFile(e.target.files[0])}
          onInputChange={(e) => setSubmitText(e.target.value)}
        />
      </div>
    </div>
  );
}

export default BountySubmit;