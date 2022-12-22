import Node from "./Node";

interface OperatorProfile {
  description: string;
  social: string;
  website: string;
}
export default interface PublicNode extends Node {
  user: number;
  isTopNode: boolean;
  profile: OperatorProfile;
  ownDelegation: number;
  isOwnValidator: boolean;
  canUndelegate: boolean;
}
