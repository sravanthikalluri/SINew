// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  base_Url: 'http://localhost:4200',
  env: 'dev',
  envName: 'Local',
  user_Api: 'https://bii62i1ojf.execute-api.us-west-2.amazonaws.com/Dev/api/user/authorize',
  download_Api: 'https://4e2k3m1ltg.execute-api.us-west-2.amazonaws.com/Dev/api/document',
  transcription_Api: 'https://80v3982yng.execute-api.us-west-2.amazonaws.com/Dev'
};
