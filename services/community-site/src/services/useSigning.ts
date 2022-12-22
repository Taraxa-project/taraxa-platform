import useChain from "./useChain";

function useSigning() {
  const { signer } = useChain();
  return (message: string) => {
    if (!signer) {
      return null;
    }
    return signer.signMessage(message);
  };
}

export default useSigning;
