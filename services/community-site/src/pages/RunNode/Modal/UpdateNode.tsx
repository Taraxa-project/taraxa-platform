import { useState } from "react";
import { Button, Text, InputField } from "@taraxa_project/taraxa-ui";

import { useApi } from "../../../services/useApi"

type UpdateNodeProps = {
  id: number,
  name: string,
  onSuccess: () => void,
}

const UpdateNode = ({ id, name, onSuccess }: UpdateNodeProps) => {
  const api = useApi();

  const [nodeName, setNodeName] = useState(name);
  const [error, setError] = useState<string | undefined>(undefined);

  const submit = async (event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(undefined);

    const result = await api.put(`/nodes/${id}`, { name: nodeName }, true);
    if (result.success) {
      onSuccess();
      return;
    }

    setError(typeof result.response === "string" ? result.response : undefined);
  }

  return (
    <div>
      <Text style={{ marginBottom: '2%' }} label="Update node" variant="h6" color="primary" />
      <form onSubmit={submit}>
        <InputField
          label="Node name"
          error={error !== undefined}
          helperText={error}
          value={nodeName}
          variant="outlined"
          type="text"
          fullWidth
          margin="normal"
          onChange={event => {
            setNodeName(event.target.value);
          }}
        />
        <Button
          type="submit"
          label="Save"
          color="secondary"
          variant="contained"
          className="marginButton"
          onClick={submit}
          fullWidth
        />
      </form>
    </div>
  )
}

export default UpdateNode;
