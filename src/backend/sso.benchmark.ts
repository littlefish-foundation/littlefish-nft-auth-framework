import { Sso } from "./sso";
import { SsoOptions } from "./types/types";
import { setConfig } from "./config";

setConfig("preprodeJMSz33SUF1JhVnLi3BG8gSMVn2vKngf", "preprod");
async function runBenchmark() {
  // Using your actual test data from the previous file
  const testOptions: SsoOptions = {
    stakeAddress: "e0a59e8cd2e3caa010782b28316b32d8aa4492f28b1788ab7861a14576",
    walletNetwork: 0,
    signature:
      "a401010327200621582088d08df872bebfbb9c198aefaf487cd7fc98fc7fc9e39058eaf1aa304eddd2c2",
    key: "84582aa201276761646472657373581de0a59e8cd2e3caa010782b28316b32d8aa4492f28b1788ab7861a14576a166686173686564f45820636333376165393961313666663437313934333164363064663131346337616358409683b3efa4547286eafede48f0d50c91b64ca6a63cc67c2beb86a1ca54ea51143d8990f5e5a3d35d3f710f584282d39e6d37a656043ddb216a8a134aef2b0405",
    nonce: "cc37ae99a16ff4719431d60df114c7ac",
    asset: {
      policyID: "9b80f2ad359fcc76802228b0cac920ce41e30b50edf86a79658597c7",
      assetName: "73736f4e667431",
      amount: 1,
    },
    issuerOption: "littlefishFoundation",
    platformUniqueIdentifiers: ["LF-AUTH-010-2024"],
    usageCount: 0,
    lastUsage: new Date().toISOString(),
  };

  // First, verify that the SSO function works with a single call
  console.log("\nTesting single SSO call:");
  try {
    const testResult = await Sso(testOptions, true);
    console.log("Single test result:", testResult);
  } catch (error) {
    console.error("Initial test failed:", error);
    return; // Exit if the initial test fails
  }

  // Run the actual benchmark
  console.log("\nStarting benchmark...");
  const iterations = 100;
  const results = {
    totalDuration: [] as number[],
    signatureVerification: [] as number[],
    metadataReading: [] as number[],
    validationChecks: [] as number[],
    assetOwnershipVerification: [] as number[],
  };

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const result = await Sso(testOptions, true);
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }

      if (result.metrics) {
        results.totalDuration.push(result.metrics.totalDuration);
        results.signatureVerification.push(
          result.metrics.signatureVerification
        );
        results.metadataReading.push(result.metrics.metadataReading);
        results.validationChecks.push(result.metrics.validationChecks);
        results.assetOwnershipVerification.push(
          result.metrics.assetOwnershipVerification
        );
      }
    } catch (error) {
      failureCount++;
      console.error(`Failed iteration ${i}:`, error);
    }
  }

  // Calculate and display statistics
  const calculateStats = (numbers: number[]) => {
    if (numbers.length === 0) return { avg: 0, min: 0, max: 0, stdDev: 0 };
    const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const variance =
      numbers.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);
    return { avg, min, max, stdDev };
  };

  console.log(`\nResults from ${iterations} iterations:`);
  console.log(
    `Success rate: ${successCount}/${iterations} (${(
      (successCount / iterations) *
      100
    ).toFixed(2)}%)`
  );

  for (const [key, values] of Object.entries(results)) {
    const stats = calculateStats(values);
    console.log(`\n${key}:`);
    console.log(`  Average: ${stats.avg.toFixed(2)}ms`);
    console.log(`  Min: ${stats.min.toFixed(2)}ms`);
    console.log(`  Max: ${stats.max.toFixed(2)}ms`);
    console.log(`  Std Dev: ${stats.stdDev.toFixed(2)}ms`);
  }
}

// Run the benchmark
runBenchmark().catch(console.error);
