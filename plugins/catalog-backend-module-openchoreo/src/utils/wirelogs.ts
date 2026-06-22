import { type OpenChoreoComponents } from '@openchoreo/openchoreo-client-node';

type NewDeploymentPipeline =
  OpenChoreoComponents['schemas']['DeploymentPipeline'];

/**
 * Annotation set by the OpenChoreo control plane on a DataPlane /
 * ClusterDataPlane CR to record its network policy provider. Wirelogs are
 * sourced from Cilium Hubble, so a value of `cilium` is the availability gate
 * for streaming wirelogs from that DataPlane. Mirrors the key read by the
 * observability backend's `fetchDataPlaneNetPolProvider`.
 */
export const CILIUM_NETPOL_PROVIDER_ANNOTATION =
  'openchoreo.dev/networkpolicyprovider';

/** True when a (Cluster)DataPlane's annotations report `cilium`. */
export const dataPlaneRunsCilium = (
  annotations?: Record<string, string>,
): boolean => annotations?.[CILIUM_NETPOL_PROVIDER_ANNOTATION] === 'cilium';

/**
 * Stable lookup key for a DataPlane in the Cilium index. ClusterDataPlanes are
 * cluster-scoped (no namespace); namespaced DataPlanes are keyed by namespace.
 */
export const dataPlaneKey = (
  kind: string,
  name: string,
  namespace?: string,
): string => (namespace ? `${kind}/${namespace}/${name}` : `${kind}/${name}`);

/**
 * Collects the unique environment names referenced by a DeploymentPipeline's
 * promotion paths (both source and target environments). These are "the
 * environments of the project" for the purpose of deciding wirelogs
 * availability.
 */
export const collectPipelineEnvNames = (
  pipeline: NewDeploymentPipeline | undefined,
): string[] => {
  const names = new Set<string>();
  for (const path of pipeline?.spec?.promotionPaths ?? []) {
    if (path.sourceEnvironmentRef?.name) {
      names.add(path.sourceEnvironmentRef.name);
    }
    for (const target of path.targetEnvironmentRefs ?? []) {
      if (target?.name) names.add(target.name);
    }
  }
  return [...names];
};

/**
 * Index built once per full catalog sync so each Component entity can be
 * stamped with `wirelogs-enabled` without per-component API calls.
 */
export interface WirelogsCiliumIndex {
  /** nsName → (envName → the env's DataPlane ref) */
  envDpRefByNs: Map<string, Map<string, { kind: string; name: string }>>;
  /** {@link dataPlaneKey} → whether that (Cluster)DataPlane runs Cilium */
  ciliumByDpKey: Map<string, boolean>;
  /** `${nsName}/${pipelineName}` → environment names referenced by the pipeline */
  pipelineEnvsByKey: Map<string, string[]>;
}

/**
 * Returns true when at least one environment of the project's deployment
 * pipeline resolves to a DataPlane running Cilium — i.e. the component-level
 * Wirelogs tab should be shown. Hidden when no pipeline, no environments, or
 * none of the backing DataPlanes run Cilium.
 */
export const projectHasCiliumEnvironment = (
  namespaceName: string,
  deploymentPipelineName: string | undefined,
  index: WirelogsCiliumIndex,
): boolean => {
  if (!deploymentPipelineName) return false;
  const envNames = index.pipelineEnvsByKey.get(
    `${namespaceName}/${deploymentPipelineName}`,
  );
  if (!envNames?.length) return false;
  const envRefMap = index.envDpRefByNs.get(namespaceName);
  if (!envRefMap) return false;
  return envNames.some(envName => {
    const ref = envRefMap.get(envName);
    if (!ref) return false;
    const ns = ref.kind === 'ClusterDataPlane' ? undefined : namespaceName;
    return (
      index.ciliumByDpKey.get(dataPlaneKey(ref.kind, ref.name, ns)) ?? false
    );
  });
};
