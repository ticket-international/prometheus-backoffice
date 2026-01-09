import { DisputesResponse } from '@/types/disputes';

export const mockDisputes: DisputesResponse = {
  items: [
    {
      dispute_id: "PP-R-LOS-606302405",
      create_time: "2025-12-11T08:09:59.000+01:00",
      update_time: "2025-12-11T08:21:20.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "7UE17980UE286364E",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "WAITING_FOR_SELLER_RESPONSE",
      dispute_state: "REQUIRED_ACTION",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "20.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "2025-12-21T22:59:59.000+01:00",
      outcome: ""
    },
    {
      dispute_id: "PP-R-PSP-605757089",
      create_time: "2025-12-08T08:55:41.000+01:00",
      update_time: "2025-12-10T16:56:42.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "4LC156750R1550800",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "10.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-AXB-605646339",
      create_time: "2025-12-07T11:27:47.000+01:00",
      update_time: "2025-12-10T17:39:16.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "31661228JY733423E",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "59.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-ARM-605426973",
      create_time: "2025-12-05T19:48:30.000+01:00",
      update_time: "2025-12-10T17:04:55.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "715619626N8536829",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "24.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-MBU-604901375",
      create_time: "2025-12-02T21:52:51.000+01:00",
      update_time: "2025-12-03T17:21:20.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "6T988833DJ526173B",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "22.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "EXTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-FFZ-604531366",
      create_time: "2025-11-30T18:53:43.000+01:00",
      update_time: "2025-12-03T17:22:14.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "9XN09744P8296533R",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "55.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-DKX-604527354",
      create_time: "2025-11-30T18:11:18.000+01:00",
      update_time: "2025-12-10T17:45:05.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "1GS36980F0435245F",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "20.40"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-DEG-604412578",
      create_time: "2025-11-29T16:53:45.000+01:00",
      update_time: "2025-12-09T23:33:23.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "3AU54151C0262225L",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "26.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-BUG-603859146",
      create_time: "2025-11-25T19:17:33.000+01:00",
      update_time: "2025-11-27T07:08:28.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "92144370E2354920D",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "18.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-LMO-603857977",
      create_time: "2025-11-25T19:10:25.000+01:00",
      update_time: "2025-12-05T23:09:34.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "1XV159703G976530E",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "UNAUTHORISED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "18.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "WON"
    },
    {
      dispute_id: "PP-R-YYL-603777459",
      create_time: "2025-11-25T08:44:32.000+01:00",
      update_time: "2025-11-27T07:03:16.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "0JX47794LC802283E",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "21.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-ADR-603581774",
      create_time: "2025-11-24T01:09:27.000+01:00",
      update_time: "2025-11-27T07:00:31.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "42Y69848R7344325X",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "20.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-RPT-603395608",
      create_time: "2025-11-22T09:57:16.000+01:00",
      update_time: "2025-11-22T12:55:04.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "01F39784TJ5638218",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "13.98"
      },
      dispute_life_cycle_stage: "INQUIRY",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "WON"
    },
    {
      dispute_id: "PP-R-IXH-603295906",
      create_time: "2025-11-21T16:19:07.000+01:00",
      update_time: "2025-12-04T16:33:42.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "447771683K6873926",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "WAITING_FOR_BUYER_RESPONSE",
      dispute_state: "REQUIRED_OTHER_PARTY_ACTION",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "48.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "WON"
    },
    {
      dispute_id: "PP-R-OKL-603295562",
      create_time: "2025-11-21T16:16:37.000+01:00",
      update_time: "2025-12-04T16:33:40.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "96156043PH909030E",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "WAITING_FOR_BUYER_RESPONSE",
      dispute_state: "REQUIRED_OTHER_PARTY_ACTION",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "48.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "WON"
    },
    {
      dispute_id: "PP-R-KAA-603295458",
      create_time: "2025-11-21T16:15:46.000+01:00",
      update_time: "2025-11-27T07:32:48.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "522795896M9930516",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "48.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-FZD-603295369",
      create_time: "2025-11-21T16:14:56.000+01:00",
      update_time: "2025-12-04T16:33:36.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "55509548MM3709526",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "WAITING_FOR_BUYER_RESPONSE",
      dispute_state: "REQUIRED_OTHER_PARTY_ACTION",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "48.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "WON"
    },
    {
      dispute_id: "PP-R-TCO-603295230",
      create_time: "2025-11-21T16:13:58.000+01:00",
      update_time: "2025-11-29T20:49:25.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "95V35045PS063231J",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "48.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    },
    {
      dispute_id: "PP-R-ZRE-603295082",
      create_time: "2025-11-21T16:12:47.000+01:00",
      update_time: "2025-12-04T16:33:37.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "2UT480637L272411L",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "WAITING_FOR_BUYER_RESPONSE",
      dispute_state: "REQUIRED_OTHER_PARTY_ACTION",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "48.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "WON"
    },
    {
      dispute_id: "PP-R-SZS-603294873",
      create_time: "2025-11-21T16:11:02.000+01:00",
      update_time: "2025-11-29T20:52:01.000+01:00",
      disputed_transactions: [
        {
          buyer_transaction_id: "6KG902711F847622T",
          seller_transaction_id: "",
          create_time: "1899-12-30T00:00:00.000+01:00",
          transaction_status: "",
          gross_amount: null,
          seller: { merchant_id: "HF8AM4CXL62KA" },
          buyer: null
        }
      ],
      reason: "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
      status: "RESOLVED",
      dispute_state: "RESOLVED",
      dispute_amount: {
        breakdown: { item_total: { currency_code: "", value: "" } },
        currency_code: "EUR",
        value: "48.00"
      },
      dispute_life_cycle_stage: "CHARGEBACK",
      dispute_channel: "INTERNAL",
      seller_response_due_date: "1899-12-30T00:00:00.000+01:00",
      outcome: "LOST"
    }
  ]
};
