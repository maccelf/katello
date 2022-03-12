import { API_OPERATIONS, post } from 'foremanReact/redux/API';
import { REX_JOB_INVOCATIONS_KEY, REX_FEATURES } from './RemoteExecutionConstants';
import { foremanApi } from '../../../../services/api';
import { errorToast, renderTaskStartedToast } from '../../../../scenes/Tasks/helpers';
import { ERRATA_SEARCH_QUERY } from './ErrataTab/HostErrataConstants';
import { TRACES_SEARCH_QUERY } from './TracesTab/HostTracesConstants';
import { PACKAGE_SEARCH_QUERY } from './PackagesTab/YumInstallablePackagesConstants';
import { PACKAGES_SEARCH_QUERY } from './PackagesTab/HostPackagesConstants';

const baseParams = ({ feature, hostname, inputs = {} }) => ({
  job_invocation: {
    feature,
    inputs,
    search_query: `name ^ (${hostname})`,
  },
});

// used when we know the package name
const katelloPackageInstallParams = ({ hostname, packageName }) =>
  baseParams({
    hostname,
    inputs: { package: packageName },
    feature: REX_FEATURES.KATELLO_PACKAGE_INSTALL,
  });

// used when we know package Id(s)
const katelloPackageInstallBySearchParams = ({ hostname, search }) =>
  baseParams({
    hostname,
    inputs: { [PACKAGE_SEARCH_QUERY]: search },
    feature: REX_FEATURES.KATELLO_PACKAGE_INSTALL_BY_SEARCH,
  });

const katelloPackageRemoveParams = ({ hostname, packageName }) =>
  baseParams({
    hostname,
    inputs: { package: packageName },
    feature: REX_FEATURES.KATELLO_PACKAGE_REMOVE,
  });

const katelloPackagesRemoveParams = ({ hostname, search }) =>
  baseParams({
    hostname,
    inputs: { [PACKAGES_SEARCH_QUERY]: search },
    feature: REX_FEATURES.KATELLO_PACKAGES_REMOVE_BY_SEARCH,
  });

const katelloPackageUpdateParams = ({ hostname, packageName }) =>
  baseParams({
    hostname,
    inputs: { package: packageName },
    feature: REX_FEATURES.KATELLO_PACKAGE_UPDATE,
  });

const katelloPackagesUpdateParams = ({ hostname, search }) =>
  baseParams({
    hostname,
    inputs: { [PACKAGES_SEARCH_QUERY]: search },
    feature: REX_FEATURES.KATELLO_PACKAGES_UPDATE_BY_SEARCH,
  });

const katelloTracerResolveParams = ({ hostname, search }) =>
  baseParams({
    hostname,
    inputs: { [TRACES_SEARCH_QUERY]: search },
    feature: REX_FEATURES.KATELLO_HOST_TRACER_RESOLVE,
  });

const katelloHostErrataInstallParams = ({
  hostname, search,
}) => baseParams({
  hostname,
  inputs: { [ERRATA_SEARCH_QUERY]: search },
  feature: REX_FEATURES.KATELLO_HOST_ERRATA_INSTALL_BY_SEARCH,
});

export const installPackage = ({ hostname, packageName }) => post({
  type: API_OPERATIONS.POST,
  key: REX_JOB_INVOCATIONS_KEY,
  url: foremanApi.getApiUrl('/job_invocations'),
  params: katelloPackageInstallParams({ hostname, packageName }),
  handleSuccess: response => renderTaskStartedToast({
    humanized: { action: `Install ${packageName} on ${hostname}` },
    id: response?.data?.dynflow_task?.id,
  }),
  errorToast: error => errorToast(error),
});

export const installPackageBySearch = ({ hostname, search }) => post({
  type: API_OPERATIONS.POST,
  key: REX_JOB_INVOCATIONS_KEY,
  url: foremanApi.getApiUrl('/job_invocations'),
  params: katelloPackageInstallBySearchParams({ hostname, search }),
  handleSuccess: response => renderTaskStartedToast({
    humanized: { action: `Install packages on ${hostname}` },
    id: response?.data?.dynflow_task?.id,
  }),
  errorToast: error => errorToast(error),
});

export const removePackage = ({ hostname, packageName }) => post({
  type: API_OPERATIONS.POST,
  key: REX_JOB_INVOCATIONS_KEY,
  url: foremanApi.getApiUrl('/job_invocations'),
  params: katelloPackageRemoveParams({ hostname, packageName }),
  handleSuccess: response => renderTaskStartedToast({
    humanized: { action: `Remove ${packageName} on ${hostname}` },
    id: response?.data?.dynflow_task?.id,
  }),
  errorToast: error => errorToast(error),
});

export const removePackages = ({ hostname, search }) => post({
  type: API_OPERATIONS.POST,
  key: REX_JOB_INVOCATIONS_KEY,
  url: foremanApi.getApiUrl('/job_invocations'),
  params: katelloPackagesRemoveParams({ hostname, search }),
  handleSuccess: response => renderTaskStartedToast({
    humanized: { action: `Remove packages on ${hostname}` },
    id: response?.data?.dynflow_task?.id,
  }),
  errorToast: error => errorToast(error),
});

export const updatePackage = ({ hostname, packageName }) => post({
  type: API_OPERATIONS.POST,
  key: REX_JOB_INVOCATIONS_KEY,
  url: foremanApi.getApiUrl('/job_invocations'),
  params: katelloPackageUpdateParams({ hostname, packageName }),
  handleSuccess: response => renderTaskStartedToast({
    humanized: { action: `Update ${packageName} on ${hostname}` },
    id: response?.data?.dynflow_task?.id,
  }),
  errorToast: error => errorToast(error),
});

export const updatePackages = ({ hostname, search }) => post({
  type: API_OPERATIONS.POST,
  key: REX_JOB_INVOCATIONS_KEY,
  url: foremanApi.getApiUrl('/job_invocations'),
  params: katelloPackagesUpdateParams({ hostname, search }),
  handleSuccess: response => renderTaskStartedToast({
    humanized: { action: `Update on ${hostname}` },
    id: response?.data?.dynflow_task?.id,
  }),
  errorToast: error => errorToast(error),
});

export const resolveTraces = ({ hostname, search }) => post({
  type: API_OPERATIONS.POST,
  key: REX_JOB_INVOCATIONS_KEY,
  url: foremanApi.getApiUrl('/job_invocations'),
  params: katelloTracerResolveParams({ hostname, search }),
  handleSuccess: response => renderTaskStartedToast({
    humanized: { action: `Resolve traces on ${hostname}` },
    id: response?.data?.dynflow_task?.id,
  }),
  errorToast: error => errorToast(error),
});

export const installErrata = ({
  hostname, search,
}) => post({
  type: API_OPERATIONS.POST,
  key: REX_JOB_INVOCATIONS_KEY,
  url: foremanApi.getApiUrl('/job_invocations'),
  params: katelloHostErrataInstallParams({
    hostname, search,
  }),
  handleSuccess: response => renderTaskStartedToast({
    humanized: { action: `Install errata on ${hostname}` },
    id: response?.data?.dynflow_task?.id,
  }),
  errorToast: error => errorToast(error),
});
