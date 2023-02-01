module.exports = ({ env }) => ({
  email: {
    provider: "sendgrid",
    providerOptions: {
      apiKey: env("SENDGRID_API_KEY"),
    },
    settings: {
      defaultFrom: "postmaster@gcp-taraxa.io",
      defaultFromName: "Postmaster Taraxa Community",
      defaultTo: "john.doe@ijs.to",
      defaultToName: "Johnny Bravodoe",
    },
  },
  upload: {
    provider: "google-cloud-storage",
    providerOptions: {
      bucketName: env("UPLOAD_BUCKET_NAME"),
      publicFiles: true,
      uniform: false,
      serviceAccount: env("SERVICE_ACCOUNT"),
      baseUrl: `https://storage.googleapis.com/${env("UPLOAD_BUCKET_NAME")}`,
      basePath: "",
    },
  },
  userspermissions: {
    kyc: {
      apiToken: env("KYC_API_TOKEN"),
      apiSecret: env("KYC_API_SECRET"),
    },
  },
});
