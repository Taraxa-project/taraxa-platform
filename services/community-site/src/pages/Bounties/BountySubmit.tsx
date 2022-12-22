import React, { useEffect, useState } from "react";
import { useParams, useHistory, Redirect } from "react-router-dom";
import * as CryptoJS from "crypto-js";

import {
  Text,
  Card,
  Button,
  File,
  Icons,
  InputField,
} from "@taraxa_project/taraxa-ui";

import Title from "../../components/Title/Title";
import Markdown from "../../components/Markdown";

import useApi from "../../services/useApi";
import { useAuth } from "../../services/useAuth";
import useBounties from "../../services/useBounties";

import { Bounty } from "./bounty";

import "./bounties.scss";

function BountySubmit() {
  const { id } = useParams<{ id: string }>();

  const api = useApi();
  const auth = useAuth();
  let userId: number | undefined;
  if (auth.isLoggedIn) {
    userId = auth.user!.id;
  }
  const history = useHistory();
  const { getBountyUserSubmissionsCount } = useBounties();
  const [bounty, setBounty] = useState<Partial<Bounty>>({});
  const [submitText, setSubmitText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    const getBounty = async (id: string) => {
      const data = await api.get(`/bounties/${id}`);
      if (!data.success) {
        return;
      }

      const userSubmissionsCount = await getBountyUserSubmissionsCount(
        data.response.id
      );

      setBounty({
        ...data.response,
        userSubmissionsCount,
        active: data.response.state?.id === 1,
      });
    };
    getBounty(id);
  }, [id, getBountyUserSubmissionsCount]);

  const submissionNeeded =
    bounty.text_submission_needed || bounty.file_submission_needed;

  if (
    !auth.isLoggedIn ||
    (bounty.id &&
      (!submissionNeeded ||
        !bounty.active ||
        (!bounty.allow_multiple_submissions &&
          bounty.userSubmissionsCount! >= 1)))
  ) {
    return <Redirect to={`/bounties/${id}`} />;
  }

  const errIndex = errors.map((error) => error.key);
  const errValues = errors.map((error) => error.value);

  const findErrorIndex = (field: string) =>
    errIndex.findIndex((err) => err === field);
  const hasError = (field: string) => findErrorIndex(field) !== -1;

  const hasSubmissionError = hasError("submission");
  const submissionErrorMessage = hasError("submission")
    ? errValues[findErrorIndex("submission")]
    : undefined;
  const hasFileError = hasError("file");
  const fileErrorMessage = hasError("file")
    ? errValues[findErrorIndex("file")]
    : undefined;

  let hasGeneralError = false;
  let generalErrorMessage;

  if (errors.length > 0 && !hasSubmissionError && !hasFileError) {
    hasGeneralError = true;
    generalErrorMessage = errValues[0];
  }

  const submit = async (
    event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrors([]);

    if (bounty.text_submission_needed && submitText === "") {
      setErrors([{ key: "submission", value: "Submission text is required" }]);
      return;
    }

    if (bounty.file_submission_needed && file === null) {
      setErrors([{ key: "file", value: "File is required" }]);
      return;
    }

    let uploadedFile;
    if (file !== null) {
      const formData = new FormData();
      formData.append("files", file!);

      const result = await api.post("/upload", formData, true);
      if (result.success) {
        uploadedFile = result.response[0];
      } else if (typeof result.response === "string") {
        setErrors([{ key: "file", value: result.response }]);
        return;
      }

      if (!uploadedFile) {
        setErrors([{ key: "file", value: "File upload failed" }]);
        return;
      }
    }

    let ciphertext = CryptoJS.AES.encrypt(
      submitText,
      "255826e3232d021e830f3dd19e77055f"
    ).toString();
    ciphertext = CryptoJS.SHA3(ciphertext).toString();

    let s: {
      user: number;
      bounty: number;
      hashed_content: string;
      file_proof?: string;
      text_proof?: string;
    } = {
      user: userId!,
      bounty: Number(bounty.id),
      hashed_content: ciphertext,
    };

    if (file !== null) {
      s = {
        ...s,
        file_proof: uploadedFile.url,
      };
    }

    if (submitText !== "") {
      s = {
        ...s,
        text_proof: submitText,
      };
    }

    const resultSubmission = await api.post("/submissions", s, true);

    if (!resultSubmission.success) {
      if (typeof resultSubmission.response === "string") {
        setErrors([{ key: "submission", value: resultSubmission.response }]);
        return;
      }
    }

    const resultBounty = await api.put(
      `/bounties/${bounty.id}`,
      {
        users: userId!,
      },
      true
    );

    if (!resultBounty.success) {
      if (typeof resultBounty.response === "string") {
        setErrors([{ key: "general", value: resultBounty.response }]);
        return;
      }
    }

    history.push(`/bounties/${bounty.id}`);
  };

  return (
    <div className="bounties">
      <div className="bounties-content">
        <Title
          title="Bounty submission"
          subtitle="Earn rewards and help grow the Taraxa's ecosystem"
        />
        <div className="bounties-details">
          <form onSubmit={submit}>
            <Card
              actions={
                <>
                  {bounty.proof_file && bounty.proof_file.trim() !== "" && (
                    <Text variant="body2" color="primary">
                      {bounty.proof_file}
                    </Text>
                  )}
                  <File onChange={(f: File) => setFile(f)} />
                  {hasFileError && (
                    <Text variant="body1" color="error">
                      {fileErrorMessage}
                    </Text>
                  )}
                  <Button
                    type="submit"
                    label="Submit"
                    color="secondary"
                    variant="contained"
                    onClick={submit}
                    fullWidth
                  />
                  {hasGeneralError && (
                    <Text variant="body1" color="error">
                      {generalErrorMessage}
                    </Text>
                  )}
                </>
              }
            >
              <Text variant="h5" color="primary" className="title">
                <span
                  className={[
                    "dot",
                    bounty.active ? "active" : "inactive",
                  ].join(" ")}
                />
                {bounty.name!}
              </Text>
              <Markdown>{bounty.submission!}</Markdown>
              <Text variant="h6" color="primary" className="subtitle">
                <Icons.Submit />
                Submit bounty
              </Text>
              {bounty.proof_text && bounty.proof_text.trim() !== "" && (
                <Text variant="body2" color="primary">
                  {bounty.proof_text}
                </Text>
              )}
              <div className="input">
                <InputField
                  label="Submission"
                  variant="filled"
                  error={hasSubmissionError}
                  helperText={submissionErrorMessage}
                  fullWidth
                  multiline
                  rows={7}
                  onChange={(input) => setSubmitText(input.target.value)}
                />
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BountySubmit;
