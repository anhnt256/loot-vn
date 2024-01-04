import { NextResponse } from "next/server";

import apiClient from "@/lib/apiClient";
import dayjs from "@/lib/dayjs";

export async function GET(
  req: Request,
  { params }: { params: { userName: string } },
) {
  try {
    const result = await apiClient({
      method: "get",
      url: `/account/${params.userName}/balance-history/?format=json`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // const actions = result.data;
    const actions = [
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 30/12/2023 12:58 - 30/12/2023 14:23",
        balance: "98840.00",
        spent_sum: "0.00",
        start: "2023-12-30T12:58:00.797278+07:00",
        end: null,
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "17000.00",
        start: "2023-12-30T13:02:07.420292+07:00",
        end: "2023-12-30T13:02:07.420292+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 29/12/2023 22:07 - 29/12/2023 23:31",
        balance: "115840.00",
        spent_sum: "0.00",
        start: "2023-12-29T22:07:00.391113+07:00",
        end: "2023-12-29T23:31:53.758635+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "115840.00",
        spent_sum: "0.00",
        start: "2023-12-29T21:28:53.170857+07:00",
        end: "2023-12-29T21:28:53.170857+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "100000.00",
        start: "2023-12-29T21:28:53.144470+07:00",
        end: "2023-12-29T21:28:53.144470+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 28/12/2023 18:17 - 28/12/2023 19:30",
        balance: "15840.00",
        spent_sum: "11826.00",
        start: "2023-12-28T18:17:00.505939+07:00",
        end: "2023-12-28T19:30:34.790155+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 28/12/2023 16:59 - 28/12/2023 16:59",
        balance: "27666.00",
        spent_sum: "0.00",
        start: "2023-12-28T16:59:00.975569+07:00",
        end: "2023-12-28T16:59:02.989380+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 27/12/2023 13:09 - 27/12/2023 22:10",
        balance: "27666.00",
        spent_sum: "77642.00",
        start: "2023-12-27T13:09:00.528465+07:00",
        end: "2023-12-27T22:10:08.148527+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "59256.00",
        spent_sum: "0.00",
        start: "2023-12-27T17:53:05.850091+07:00",
        end: "2023-12-27T17:53:05.850091+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-12-27T17:53:05.825346+07:00",
        end: "2023-12-27T17:53:05.825346+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 27/12/2023 09:37 - 27/12/2023 10:24",
        balance: "55264.00",
        spent_sum: "7614.00",
        start: "2023-12-27T09:37:00.407033+07:00",
        end: "2023-12-27T10:24:07.694451+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 26/12/2023 15:02 - 26/12/2023 18:51",
        balance: "62878.00",
        spent_sum: "37098.00",
        start: "2023-12-26T15:02:00.559756+07:00",
        end: "2023-12-26T18:51:39.388851+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 26/12/2023 14:18 - 26/12/2023 15:01",
        balance: "99976.00",
        spent_sum: "532.00",
        start: "2023-12-26T14:18:00.403990+07:00",
        end: "2023-12-26T15:01:47.091908+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "30000.00",
        start: "2023-12-26T14:19:16.974194+07:00",
        end: "2023-12-26T14:19:16.974194+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 26/12/2023 12:54 - 26/12/2023 14:15",
        balance: "130488.00",
        spent_sum: "0.00",
        start: "2023-12-26T12:54:00.520145+07:00",
        end: "2023-12-26T14:15:56.474634+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "17000.00",
        start: "2023-12-26T13:43:12.992667+07:00",
        end: "2023-12-26T13:43:12.992667+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 24/12/2023 17:01 - 24/12/2023 17:10",
        balance: "147488.00",
        spent_sum: "0.00",
        start: "2023-12-24T17:01:00.550701+07:00",
        end: "2023-12-24T17:10:58.841753+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 24/12/2023 14:07 - 24/12/2023 14:52",
        balance: "147488.00",
        spent_sum: "0.00",
        start: "2023-12-24T14:07:00.480827+07:00",
        end: "2023-12-24T14:52:44.999969+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 24/12/2023 07:01 - 24/12/2023 14:04",
        balance: "147488.00",
        spent_sum: "0.00",
        start: "2023-12-24T07:01:00.865143+07:00",
        end: "2023-12-24T14:04:34.089956+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "17000.00",
        start: "2023-12-24T12:16:53.453375+07:00",
        end: "2023-12-24T12:16:53.453375+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "164488.00",
        spent_sum: "0.00",
        start: "2023-12-23T21:54:29.591067+07:00",
        end: "2023-12-23T21:54:29.591067+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-12-23T21:54:29.563963+07:00",
        end: "2023-12-23T21:54:29.563963+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "114488.00",
        spent_sum: "0.00",
        start: "2023-12-23T21:52:25.976520+07:00",
        end: "2023-12-23T21:52:25.976520+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "100000.00",
        start: "2023-12-23T21:52:25.937614+07:00",
        end: "2023-12-23T21:52:25.937614+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 23/12/2023 14:44 - 23/12/2023 16:54",
        balance: "14488.00",
        spent_sum: "6110.00",
        start: "2023-12-23T14:44:00.472506+07:00",
        end: "2023-12-23T16:54:38.865366+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 23/12/2023 09:28 - 23/12/2023 10:43",
        balance: "20598.00",
        spent_sum: "3525.00",
        start: "2023-12-23T09:28:00.881058+07:00",
        end: "2023-12-23T10:43:01.031596+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 22/12/2023 17:01 - 22/12/2023 17:20",
        balance: "24123.00",
        spent_sum: "3078.00",
        start: "2023-12-22T17:01:00.463058+07:00",
        end: "2023-12-22T17:20:48.911554+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 22/12/2023 13:00 - 22/12/2023 13:35",
        balance: "27201.00",
        spent_sum: "1645.00",
        start: "2023-12-22T13:00:00.874059+07:00",
        end: "2023-12-22T13:35:27.155025+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 22/12/2023 10:49 - 22/12/2023 12:56",
        balance: "28846.00",
        spent_sum: "5969.00",
        start: "2023-12-22T10:49:00.497211+07:00",
        end: "2023-12-22T12:56:38.474995+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 21/12/2023 17:00 - 21/12/2023 19:59",
        balance: "34815.00",
        spent_sum: "20758.00",
        start: "2023-12-21T17:00:00.432066+07:00",
        end: "2023-12-21T19:59:14.817615+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 21/12/2023 08:10 - 21/12/2023 17:00",
        balance: "55551.00",
        spent_sum: "23265.00",
        start: "2023-12-21T08:10:00.391888+07:00",
        end: "2023-12-21T17:00:00.432568+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "55551.00",
        spent_sum: "0.00",
        start: "2023-12-21T16:25:37.750993+07:00",
        end: "2023-12-21T16:25:37.750993+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-12-21T16:25:37.709783+07:00",
        end: "2023-12-21T16:25:37.709783+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 21/12/2023 07:22 - 21/12/2023 08:07",
        balance: "28816.00",
        spent_sum: "2115.00",
        start: "2023-12-21T07:22:00.430699+07:00",
        end: "2023-12-21T08:07:52.776174+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 21/12/2023 07:10 - 21/12/2023 07:20",
        balance: "30931.00",
        spent_sum: "470.00",
        start: "2023-12-21T07:10:00.664527+07:00",
        end: "2023-12-21T07:20:54.646866+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 20/12/2023 17:00 - 20/12/2023 19:48",
        balance: "31401.00",
        spent_sum: "27378.00",
        start: "2023-12-20T17:00:02.956354+07:00",
        end: "2023-12-20T19:48:28.788510+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 20/12/2023 16:37 - 20/12/2023 17:00",
        balance: "58779.00",
        spent_sum: "1034.00",
        start: "2023-12-20T16:37:00.890462+07:00",
        end: "2023-12-20T17:00:02.956607+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 20/12/2023 07:56 - 20/12/2023 16:36",
        balance: "59813.00",
        spent_sum: "14440.00",
        start: "2023-12-20T07:56:00.597244+07:00",
        end: "2023-12-20T16:36:08.147010+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "60283.00",
        spent_sum: "0.00",
        start: "2023-12-20T12:53:07.287261+07:00",
        end: "2023-12-20T12:53:07.287261+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-12-20T12:53:07.270163+07:00",
        end: "2023-12-20T12:53:07.270163+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 19/12/2023 22:11 - 19/12/2023 22:59",
        balance: "24242.00",
        spent_sum: "7776.00",
        start: "2023-12-19T22:11:00.438563+07:00",
        end: "2023-12-19T22:59:31.614274+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 19/12/2023 17:00 - 19/12/2023 19:12",
        balance: "32018.00",
        spent_sum: "18032.00",
        start: "2023-12-19T17:00:00.476271+07:00",
        end: "2023-12-19T19:12:58.044762+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 19/12/2023 15:59 - 19/12/2023 17:00",
        balance: "50000.00",
        spent_sum: "0.00",
        start: "2023-12-19T15:59:00.838010+07:00",
        end: "2023-12-19T17:00:00.476680+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 19/12/2023 14:40 - 19/12/2023 15:58",
        balance: "50000.00",
        spent_sum: "0.00",
        start: "2023-12-19T14:40:00.837152+07:00",
        end: "2023-12-19T15:58:37.102241+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "50000.00",
        spent_sum: "0.00",
        start: "2023-12-19T11:34:31.499709+07:00",
        end: "2023-12-19T11:34:31.499709+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-12-19T11:34:31.440255+07:00",
        end: "2023-12-19T11:34:31.440255+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 18/12/2023 12:08 - 18/12/2023 13:17",
        balance: "-47.00",
        spent_sum: "3243.00",
        start: "2023-12-18T12:08:00.630485+07:00",
        end: "2023-12-18T13:17:00.291485+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 18/12/2023 11:02 - 18/12/2023 11:16",
        balance: "3170.00",
        spent_sum: "658.00",
        start: "2023-12-18T11:02:00.412452+07:00",
        end: "2023-12-18T11:16:10.119170+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 17/12/2023 11:33 - 17/12/2023 14:59",
        balance: "3828.00",
        spent_sum: "9682.00",
        start: "2023-12-17T11:33:00.710865+07:00",
        end: "2023-12-17T14:59:17.589970+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 17/12/2023 08:04 - 17/12/2023 11:32",
        balance: "13510.00",
        spent_sum: "9776.00",
        start: "2023-12-17T08:04:00.404862+07:00",
        end: "2023-12-17T11:32:47.581635+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 16/12/2023 15:17 - 16/12/2023 15:23",
        balance: "23286.00",
        spent_sum: "282.00",
        start: "2023-12-16T15:17:00.402602+07:00",
        end: "2023-12-16T15:23:46.054566+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 16/12/2023 13:00 - 16/12/2023 15:15",
        balance: "23568.00",
        spent_sum: "6345.00",
        start: "2023-12-16T13:00:00.333801+07:00",
        end: "2023-12-16T15:15:29.589095+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 15/12/2023 16:40 - 16/12/2023 00:20",
        balance: "29913.00",
        spent_sum: "59262.00",
        start: "2023-12-15T16:40:00.331353+07:00",
        end: "2023-12-16T00:20:29.893233+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 15/12/2023 15:08 - 15/12/2023 16:39",
        balance: "89145.00",
        spent_sum: "0.00",
        start: "2023-12-15T15:08:00.455424+07:00",
        end: "2023-12-15T16:39:51.379964+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "17000.00",
        start: "2023-12-15T15:10:08.167182+07:00",
        end: "2023-12-15T15:10:08.167182+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "106145.00",
        spent_sum: "0.00",
        start: "2023-12-15T15:07:41.615653+07:00",
        end: "2023-12-15T15:07:41.615653+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "100000.00",
        start: "2023-12-15T15:07:41.583450+07:00",
        end: "2023-12-15T15:07:41.583450+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 14/12/2023 12:03 - 14/12/2023 22:25",
        balance: "6145.00",
        spent_sum: "74004.00",
        start: "2023-12-14T12:03:00.369951+07:00",
        end: "2023-12-14T22:25:57.849025+07:00",
      },
      {
        action_name:
          "Ticket session, period 14/12/2023 11:47 - 14/12/2023 12:03",
        balance: "80119.00",
        spent_sum: "0.00",
        start: "2023-12-14T11:47:00.373335+07:00",
        end: "2023-12-14T12:03:00.370104+07:00",
      },
      {
        action_name:
          "Ticket session, period 14/12/2023 07:02 - 14/12/2023 11:43",
        balance: "80119.00",
        spent_sum: "0.00",
        start: "2023-12-14T07:02:00.413627+07:00",
        end: "2023-12-14T11:43:34.738413+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 14/12/2023 06:42 - 14/12/2023 07:02",
        balance: "105119.00",
        spent_sum: "0.00",
        start: "2023-12-14T06:42:00.481493+07:00",
        end: "2023-12-14T07:02:00.413743+07:00",
      },
      {
        action_name: "Mua vé trọn gói",
        balance: null,
        spent_sum: "25000.00",
        start: "2023-12-14T07:01:56.308667+07:00",
        end: "2023-12-14T07:01:56.308667+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "105119.00",
        spent_sum: "0.00",
        start: "2023-12-14T06:41:35.553754+07:00",
        end: "2023-12-14T06:41:35.553754+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "100000.00",
        start: "2023-12-14T06:41:35.528483+07:00",
        end: "2023-12-14T06:41:35.528483+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 13/12/2023 15:59 - 13/12/2023 20:59",
        balance: "5119.00",
        spent_sum: "41354.00",
        start: "2023-12-13T15:59:00.446909+07:00",
        end: "2023-12-13T20:59:10.470362+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "17000.00",
        start: "2023-12-13T16:07:39.238938+07:00",
        end: "2023-12-13T16:07:39.238938+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 13/12/2023 15:41 - 13/12/2023 15:58",
        balance: "63429.00",
        spent_sum: "0.00",
        start: "2023-12-13T15:41:00.283423+07:00",
        end: "2023-12-13T15:58:11.871762+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "63429.00",
        spent_sum: "0.00",
        start: "2023-12-13T15:40:39.070925+07:00",
        end: "2023-12-13T15:40:39.070925+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-12-13T15:40:39.044474+07:00",
        end: "2023-12-13T15:40:39.044474+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 12/12/2023 19:12 - 12/12/2023 21:26",
        balance: "13429.00",
        spent_sum: "21708.00",
        start: "2023-12-12T19:12:00.353799+07:00",
        end: "2023-12-12T21:26:18.106716+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 12/12/2023 15:04 - 12/12/2023 19:11",
        balance: "35137.00",
        spent_sum: "40014.00",
        start: "2023-12-12T15:04:00.265722+07:00",
        end: "2023-12-12T19:11:36.377915+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 07/12/2023 16:29 - 07/12/2023 19:02",
        balance: "75151.00",
        spent_sum: "24786.00",
        start: "2023-12-07T16:29:00.470042+07:00",
        end: "2023-12-07T19:02:44.562713+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 07/12/2023 15:30 - 07/12/2023 15:34",
        balance: "99937.00",
        spent_sum: "648.00",
        start: "2023-12-07T15:30:00.436511+07:00",
        end: "2023-12-07T15:34:42.830668+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 06/12/2023 19:33 - 06/12/2023 19:40",
        balance: "100585.00",
        spent_sum: "889.00",
        start: "2023-12-06T19:33:00.435965+07:00",
        end: "2023-12-06T19:40:00.300275+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 06/12/2023 17:49 - 06/12/2023 18:51",
        balance: "101474.00",
        spent_sum: "10044.00",
        start: "2023-12-06T17:49:00.513077+07:00",
        end: "2023-12-06T18:51:23.309179+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 06/12/2023 14:14 - 06/12/2023 17:48",
        balance: "111518.00",
        spent_sum: "4668.00",
        start: "2023-12-06T14:14:00.347520+07:00",
        end: "2023-12-06T17:48:26.393489+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "116156.00",
        spent_sum: "0.00",
        start: "2023-12-06T14:14:45.246680+07:00",
        end: "2023-12-06T14:14:45.246680+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "100000.00",
        start: "2023-12-06T14:14:45.224371+07:00",
        end: "2023-12-06T14:14:45.224371+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 05/12/2023 14:48 - 05/12/2023 15:04",
        balance: "16156.00",
        spent_sum: "2592.00",
        start: "2023-12-05T14:48:00.417703+07:00",
        end: "2023-12-05T15:04:21.941374+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "30000.00",
        start: "2023-12-05T15:03:42.775746+07:00",
        end: "2023-12-05T15:03:42.775746+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 05/12/2023 10:48 - 05/12/2023 14:44",
        balance: "48748.00",
        spent_sum: "28232.00",
        start: "2023-12-05T10:48:00.552297+07:00",
        end: "2023-12-05T14:44:22.504558+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "69484.00",
        spent_sum: "0.00",
        start: "2023-12-05T11:34:22.755397+07:00",
        end: "2023-12-05T11:34:22.755397+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-12-05T11:34:22.710863+07:00",
        end: "2023-12-05T11:34:22.710863+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 05/12/2023 10:45 - 05/12/2023 10:46",
        balance: "26936.00",
        spent_sum: "162.00",
        start: "2023-12-05T10:45:00.416184+07:00",
        end: "2023-12-05T10:46:49.403891+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 04/12/2023 15:12 - 04/12/2023 22:03",
        balance: "27098.00",
        spent_sum: "46582.00",
        start: "2023-12-04T15:12:00.397897+07:00",
        end: "2023-12-04T22:03:57.392286+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "34000.00",
        start: "2023-12-04T18:19:41.646147+07:00",
        end: "2023-12-04T18:19:41.646147+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "87342.00",
        spent_sum: "0.00",
        start: "2023-12-04T18:19:19.905944+07:00",
        end: "2023-12-04T18:19:19.905944+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-12-04T18:19:19.879861+07:00",
        end: "2023-12-04T18:19:19.879861+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "57592.00",
        spent_sum: "0.00",
        start: "2023-12-03T22:05:20.534597+07:00",
        end: "2023-12-03T22:05:20.534597+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-12-03T22:05:20.509587+07:00",
        end: "2023-12-03T22:05:20.509587+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 30/11/2023 14:01 - 30/11/2023 21:18",
        balance: "7592.00",
        spent_sum: "40956.00",
        start: "2023-11-30T14:01:00.364077+07:00",
        end: "2023-11-30T21:18:34.989462+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "15000.00",
        start: "2023-11-30T20:32:41.506192+07:00",
        end: "2023-11-30T20:32:41.506192+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "17000.00",
        start: "2023-11-30T14:16:40.431356+07:00",
        end: "2023-11-30T14:16:40.431356+07:00",
      },
      {
        action_name:
          "Ticket session, period 30/11/2023 11:51 - 30/11/2023 14:01",
        balance: "80518.00",
        spent_sum: "0.00",
        start: "2023-11-30T11:51:00.299054+07:00",
        end: "2023-11-30T14:01:00.364262+07:00",
      },
      {
        action_name:
          "Ticket session, period 30/11/2023 10:02 - 30/11/2023 11:49",
        balance: "80518.00",
        spent_sum: "0.00",
        start: "2023-11-30T10:02:00.265675+07:00",
        end: "2023-11-30T11:49:54.903187+07:00",
      },
      {
        action_name:
          "Ticket session, period 30/11/2023 09:18 - 30/11/2023 10:00",
        balance: "80518.00",
        spent_sum: "0.00",
        start: "2023-11-30T09:18:00.516485+07:00",
        end: "2023-11-30T10:00:48.011294+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 30/11/2023 09:17 - 30/11/2023 09:18",
        balance: "22518.00",
        spent_sum: "0.00",
        start: "2023-11-30T09:17:00.368300+07:00",
        end: "2023-11-30T09:18:00.516617+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "42000.00",
        start: "2023-11-30T09:17:35.025377+07:00",
        end: "2023-11-30T09:17:35.025377+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "122518.00",
        spent_sum: "0.00",
        start: "2023-11-30T09:17:13.064918+07:00",
        end: "2023-11-30T09:17:13.064918+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "100000.00",
        start: "2023-11-30T09:17:13.048290+07:00",
        end: "2023-11-30T09:17:13.048290+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 29/11/2023 15:04 - 29/11/2023 20:38",
        balance: "22518.00",
        spent_sum: "44108.00",
        start: "2023-11-29T15:04:00.491805+07:00",
        end: "2023-11-29T20:38:46.862145+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "52326.00",
        spent_sum: "0.00",
        start: "2023-11-29T16:32:24.592750+07:00",
        end: "2023-11-29T16:32:24.592750+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-11-29T16:32:24.570256+07:00",
        end: "2023-11-29T16:32:24.570256+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 28/11/2023 15:03 - 28/11/2023 21:52",
        balance: "16582.00",
        spent_sum: "14472.00",
        start: "2023-11-28T15:03:00.386621+07:00",
        end: "2023-11-28T21:52:40.907132+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 28/11/2023 09:40 - 28/11/2023 09:58",
        balance: "51000.00",
        spent_sum: "0.00",
        start: "2023-11-28T09:40:00.292163+07:00",
        end: "2023-11-28T09:58:46.866126+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "20000.00",
        start: "2023-11-28T09:58:41.305330+07:00",
        end: "2023-11-28T09:58:41.305330+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 27/11/2023 15:05 - 27/11/2023 18:41",
        balance: "51000.00",
        spent_sum: "0.00",
        start: "2023-11-27T15:05:00.515808+07:00",
        end: "2023-11-27T18:41:18.346443+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "54000.00",
        start: "2023-11-27T11:02:46.585047+07:00",
        end: "2023-11-27T11:02:46.585047+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "105000.00",
        spent_sum: "0.00",
        start: "2023-11-26T21:45:12.633188+07:00",
        end: "2023-11-26T21:45:12.633188+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "55000.00",
        start: "2023-11-26T21:45:12.602055+07:00",
        end: "2023-11-26T21:45:12.602055+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 26/11/2023 15:29 - 26/11/2023 16:51",
        balance: "50000.00",
        spent_sum: "0.00",
        start: "2023-11-26T15:29:00.555781+07:00",
        end: "2023-11-26T16:51:34.005133+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 26/11/2023 12:28 - 26/11/2023 14:19",
        balance: "50000.00",
        spent_sum: "0.00",
        start: "2023-11-26T12:28:00.422942+07:00",
        end: "2023-11-26T14:19:10.025664+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "50000.00",
        spent_sum: "0.00",
        start: "2023-11-26T12:27:28.637146+07:00",
        end: "2023-11-26T12:27:28.637146+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-11-26T12:27:28.616971+07:00",
        end: "2023-11-26T12:27:28.616971+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 25/11/2023 14:56 - 25/11/2023 15:16",
        balance: "-162.00",
        spent_sum: "3240.00",
        start: "2023-11-25T14:56:00.610636+07:00",
        end: "2023-11-25T15:16:00.425678+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 24/11/2023 22:39 - 24/11/2023 22:55",
        balance: "3061.00",
        spent_sum: "2592.00",
        start: "2023-11-24T22:39:00.736942+07:00",
        end: "2023-11-24T22:55:06.277434+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 23/11/2023 21:59 - 24/11/2023 00:04",
        balance: "5653.00",
        spent_sum: "20250.00",
        start: "2023-11-23T21:59:00.360121+07:00",
        end: "2023-11-24T00:04:43.609833+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 23/11/2023 08:59 - 23/11/2023 09:19",
        balance: "25903.00",
        spent_sum: "3240.00",
        start: "2023-11-23T08:59:00.585777+07:00",
        end: "2023-11-23T09:19:22.127145+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 21/11/2023 20:21 - 21/11/2023 21:12",
        balance: "29143.00",
        spent_sum: "5228.00",
        start: "2023-11-21T20:21:00.637585+07:00",
        end: "2023-11-21T21:12:41.745481+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 20/11/2023 15:05 - 20/11/2023 17:44",
        balance: "34327.00",
        spent_sum: "17702.00",
        start: "2023-11-20T15:05:00.329573+07:00",
        end: "2023-11-20T17:44:39.257868+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "16000.00",
        start: "2023-11-20T17:25:17.930434+07:00",
        end: "2023-11-20T17:25:17.930434+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "50327.00",
        spent_sum: "0.00",
        start: "2023-11-20T17:01:31.590724+07:00",
        end: "2023-11-20T17:01:31.590724+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-11-20T17:01:31.560423+07:00",
        end: "2023-11-20T17:01:31.560423+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 19/11/2023 14:01 - 19/11/2023 14:55",
        balance: "17985.00",
        spent_sum: "0.00",
        start: "2023-11-19T14:01:00.557170+07:00",
        end: "2023-11-19T14:55:31.790608+07:00",
      },
      {
        action_name:
          "Ticket session, period 19/11/2023 10:58 - 19/11/2023 14:01",
        balance: "17985.00",
        spent_sum: "0.00",
        start: "2023-11-19T10:58:00.466536+07:00",
        end: "2023-11-19T14:01:00.557390+07:00",
      },
      {
        action_name:
          "Ticket session, period 19/11/2023 10:12 - 19/11/2023 10:57",
        balance: "17985.00",
        spent_sum: "0.00",
        start: "2023-11-19T10:12:00.760944+07:00",
        end: "2023-11-19T10:57:08.571918+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 19/11/2023 10:11 - 19/11/2023 10:12",
        balance: "9985.00",
        spent_sum: "0.00",
        start: "2023-11-19T10:11:00.426715+07:00",
        end: "2023-11-19T10:12:00.761106+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "42000.00",
        start: "2023-11-19T10:11:48.864753+07:00",
        end: "2023-11-19T10:11:48.864753+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "59985.00",
        spent_sum: "0.00",
        start: "2023-11-19T10:11:26.636352+07:00",
        end: "2023-11-19T10:11:26.636352+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-11-19T10:11:26.603688+07:00",
        end: "2023-11-19T10:11:26.603688+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 18/11/2023 22:21 - 18/11/2023 22:39",
        balance: "9985.00",
        spent_sum: "2916.00",
        start: "2023-11-18T22:21:00.578073+07:00",
        end: "2023-11-18T22:39:28.049054+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 16/11/2023 21:52 - 17/11/2023 00:26",
        balance: "12901.00",
        spent_sum: "2904.00",
        start: "2023-11-16T21:52:00.380286+07:00",
        end: "2023-11-17T00:26:48.757186+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "37000.00",
        start: "2023-11-16T23:22:01.288984+07:00",
        end: "2023-11-16T23:22:01.288984+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 16/11/2023 21:42 - 16/11/2023 21:49",
        balance: "52793.00",
        spent_sum: "0.00",
        start: "2023-11-16T21:42:00.336752+07:00",
        end: "2023-11-16T21:49:56.556168+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 16/11/2023 19:22 - 16/11/2023 21:40",
        balance: "52793.00",
        spent_sum: "0.00",
        start: "2023-11-16T19:22:00.650499+07:00",
        end: "2023-11-16T21:40:12.677117+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 16/11/2023 18:47 - 16/11/2023 19:20",
        balance: "52793.00",
        spent_sum: "0.00",
        start: "2023-11-16T18:47:00.567162+07:00",
        end: "2023-11-16T19:20:53.851045+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 16/11/2023 18:01 - 16/11/2023 18:45",
        balance: "52793.00",
        spent_sum: "0.00",
        start: "2023-11-16T18:01:00.311596+07:00",
        end: "2023-11-16T18:45:43.516122+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "34000.00",
        start: "2023-11-15T19:30:45.418569+07:00",
        end: "2023-11-15T19:30:45.418569+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 15/11/2023 14:22 - 15/11/2023 14:22",
        balance: "86793.00",
        spent_sum: "0.00",
        start: "2023-11-15T14:22:02.074545+07:00",
        end: "2023-11-15T14:22:21.892946+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "35000.00",
        start: "2023-11-15T14:21:40.815151+07:00",
        end: "2023-11-15T14:21:40.815151+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 14/11/2023 17:24 - 14/11/2023 21:49",
        balance: "121793.00",
        spent_sum: "0.00",
        start: "2023-11-14T17:24:00.577324+07:00",
        end: "2023-11-14T21:49:52.691443+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 14/11/2023 16:16 - 14/11/2023 17:08",
        balance: "121793.00",
        spent_sum: "0.00",
        start: "2023-11-14T16:16:00.685067+07:00",
        end: "2023-11-14T17:08:57.379245+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "33000.00",
        start: "2023-11-14T17:01:05.744323+07:00",
        end: "2023-11-14T17:01:05.744323+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 13/11/2023 14:02 - 13/11/2023 19:31",
        balance: "154793.00",
        spent_sum: "0.00",
        start: "2023-11-13T14:02:00.344575+07:00",
        end: "2023-11-13T19:31:00.583092+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "15000.00",
        start: "2023-11-13T17:40:56.038516+07:00",
        end: "2023-11-13T17:40:56.038516+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "16000.00",
        start: "2023-11-13T15:15:44.986632+07:00",
        end: "2023-11-13T15:15:44.986632+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 12/11/2023 10:51 - 12/11/2023 14:51",
        balance: "185793.00",
        spent_sum: "0.00",
        start: "2023-11-12T10:51:00.358702+07:00",
        end: "2023-11-12T14:51:01.259080+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "17000.00",
        start: "2023-11-12T12:20:38.325244+07:00",
        end: "2023-11-12T12:20:38.325244+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "202793.00",
        spent_sum: "0.00",
        start: "2023-11-11T21:54:08.553645+07:00",
        end: "2023-11-11T21:54:08.553645+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "200000.00",
        start: "2023-11-11T21:54:08.516759+07:00",
        end: "2023-11-11T21:54:08.516759+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 09/11/2023 11:32 - 09/11/2023 12:55",
        balance: "2793.00",
        spent_sum: "13446.00",
        start: "2023-11-09T11:32:00.393048+07:00",
        end: "2023-11-09T12:55:29.629429+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 08/11/2023 10:10 - 08/11/2023 11:56",
        balance: "16239.00",
        spent_sum: "17172.00",
        start: "2023-11-08T10:10:00.313326+07:00",
        end: "2023-11-08T11:56:31.376428+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "17000.00",
        start: "2023-11-08T10:13:09.537119+07:00",
        end: "2023-11-08T10:13:09.537119+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 07/11/2023 15:12 - 07/11/2023 21:09",
        balance: "50411.00",
        spent_sum: "3412.00",
        start: "2023-11-07T15:12:00.635421+07:00",
        end: "2023-11-07T21:09:50.483164+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "17000.00",
        start: "2023-11-07T18:55:10.343436+07:00",
        end: "2023-11-07T18:55:10.343436+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 06/11/2023 06:55 - 06/11/2023 06:57",
        balance: "86813.00",
        spent_sum: "0.00",
        start: "2023-11-06T06:55:00.362594+07:00",
        end: "2023-11-06T06:57:07.743421+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "16000.00",
        start: "2023-11-06T06:57:03.939047+07:00",
        end: "2023-11-06T06:57:03.939047+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 04/11/2023 23:59 - 05/11/2023 00:21",
        balance: "86813.00",
        spent_sum: "0.00",
        start: "2023-11-04T23:59:00.317713+07:00",
        end: "2023-11-05T00:21:25.269953+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "54000.00",
        start: "2023-11-05T00:20:40.886174+07:00",
        end: "2023-11-05T00:20:40.886174+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 04/11/2023 21:40 - 04/11/2023 22:35",
        balance: "140813.00",
        spent_sum: "0.00",
        start: "2023-11-04T21:40:00.583855+07:00",
        end: "2023-11-04T22:35:36.149096+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "140813.00",
        spent_sum: "0.00",
        start: "2023-11-04T14:43:15.146827+07:00",
        end: "2023-11-04T14:43:15.146827+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-11-04T14:43:15.124104+07:00",
        end: "2023-11-04T14:43:15.124104+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 04/11/2023 01:18 - 04/11/2023 01:19",
        balance: "90813.00",
        spent_sum: "0.00",
        start: "2023-11-04T01:18:00.325776+07:00",
        end: "2023-11-04T01:19:16.596503+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "49000.00",
        start: "2023-11-04T01:18:30.417694+07:00",
        end: "2023-11-04T01:18:30.417694+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 02/11/2023 18:31 - 02/11/2023 22:06",
        balance: "139813.00",
        spent_sum: "0.00",
        start: "2023-11-02T18:31:00.311955+07:00",
        end: "2023-11-02T22:06:25.426653+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 01/11/2023 22:01 - 01/11/2023 22:12",
        balance: "139813.00",
        spent_sum: "0.00",
        start: "2023-11-01T22:01:00.563591+07:00",
        end: "2023-11-01T22:12:03.265295+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 31/10/2023 17:42 - 31/10/2023 19:53",
        balance: "139813.00",
        spent_sum: "0.00",
        start: "2023-10-31T17:42:00.550802+07:00",
        end: "2023-10-31T19:53:59.312532+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 31/10/2023 14:47 - 31/10/2023 14:52",
        balance: "139813.00",
        spent_sum: "0.00",
        start: "2023-10-31T14:47:00.577878+07:00",
        end: "2023-10-31T14:52:36.503067+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "139813.00",
        spent_sum: "0.00",
        start: "2023-10-31T14:51:42.251347+07:00",
        end: "2023-10-31T14:51:42.251347+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "100000.00",
        start: "2023-10-31T14:51:42.222712+07:00",
        end: "2023-10-31T14:51:42.222712+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 30/10/2023 17:14 - 30/10/2023 18:51",
        balance: "39813.00",
        spent_sum: "0.00",
        start: "2023-10-30T17:14:00.446063+07:00",
        end: "2023-10-30T18:51:18.460462+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "20000.00",
        start: "2023-10-30T18:15:56.374905+07:00",
        end: "2023-10-30T18:15:56.374905+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 30/10/2023 16:48 - 30/10/2023 17:13",
        balance: "59813.00",
        spent_sum: "0.00",
        start: "2023-10-30T16:48:00.390213+07:00",
        end: "2023-10-30T17:13:03.536392+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 17/10/2023 13:37 - 17/10/2023 14:07",
        balance: "59813.00",
        spent_sum: "0.00",
        start: "2023-10-17T13:37:00.623581+07:00",
        end: "2023-10-17T14:07:42.032408+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 17/10/2023 11:58 - 17/10/2023 13:37",
        balance: "59813.00",
        spent_sum: "0.00",
        start: "2023-10-17T11:58:00.452784+07:00",
        end: "2023-10-17T13:37:00.623751+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 15/10/2023 18:58 - 15/10/2023 19:32",
        balance: "59813.00",
        spent_sum: "2691.00",
        start: "2023-10-15T18:58:00.477275+07:00",
        end: "2023-10-15T19:32:51.422334+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "59813.00",
        spent_sum: "0.00",
        start: "2023-10-15T19:21:34.355169+07:00",
        end: "2023-10-15T19:21:34.355169+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-10-15T19:21:34.343500+07:00",
        end: "2023-10-15T19:21:34.343500+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-10-15T19:21:12.604614+07:00",
        end: "2023-10-15T19:21:12.604614+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 14/10/2023 12:33 - 14/10/2023 12:39",
        balance: "12504.00",
        spent_sum: "702.00",
        start: "2023-10-14T12:33:00.395163+07:00",
        end: "2023-10-14T12:39:00.778161+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 09/10/2023 11:00 - 09/10/2023 17:07",
        balance: "13206.00",
        spent_sum: "66794.00",
        start: "2023-10-09T11:00:00.358171+07:00",
        end: "2023-10-09T17:07:42.926651+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-10-09T13:07:48.401977+07:00",
        end: "2023-10-09T13:07:48.401977+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "30000.00",
        start: "2023-10-09T10:59:14.194836+07:00",
        end: "2023-10-09T10:59:14.194836+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 28/09/2023 17:50 - 28/09/2023 17:53",
        balance: "-132.00",
        spent_sum: "396.00",
        start: "2023-09-28T17:50:00.578072+07:00",
        end: "2023-09-28T17:53:00.386369+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 28/09/2023 13:17 - 28/09/2023 14:48",
        balance: "-182.00",
        spent_sum: "16562.00",
        start: "2023-09-28T13:17:00.478505+07:00",
        end: "2023-09-28T14:48:00.298079+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "0.00",
        start: "2023-09-28T13:17:21.561082+07:00",
        end: "2023-09-28T13:17:21.561082+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 25/08/2023 17:22 - 25/08/2023 17:22",
        balance: "16256.00",
        spent_sum: "0.00",
        start: "2023-08-25T17:22:00.577178+07:00",
        end: "2023-08-25T17:22:02.316113+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 23/08/2023 21:44 - 23/08/2023 23:58",
        balance: "16256.00",
        spent_sum: "9748.00",
        start: "2023-08-23T21:44:00.688307+07:00",
        end: "2023-08-23T23:58:23.005899+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 22/08/2023 16:03 - 22/08/2023 17:24",
        balance: "26000.00",
        spent_sum: "0.00",
        start: "2023-08-22T16:03:00.650482+07:00",
        end: "2023-08-22T17:24:05.717460+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 10/08/2023 17:09 - 10/08/2023 17:15",
        balance: "26000.00",
        spent_sum: "0.00",
        start: "2023-08-10T17:09:00.594841+07:00",
        end: "2023-08-10T17:15:13.483300+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 01/08/2023 13:55 - 01/08/2023 15:14",
        balance: "26000.00",
        spent_sum: "0.00",
        start: "2023-08-01T13:55:00.456105+07:00",
        end: "2023-08-01T15:14:10.846487+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 22/07/2023 08:14 - 22/07/2023 10:34",
        balance: "26000.00",
        spent_sum: "0.00",
        start: "2023-07-22T08:14:00.592622+07:00",
        end: "2023-07-22T10:34:00.123716+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 20/07/2023 10:41 - 20/07/2023 10:45",
        balance: "26000.00",
        spent_sum: "0.00",
        start: "2023-07-20T10:41:00.652173+07:00",
        end: "2023-07-20T10:45:08.443698+07:00",
      },
      {
        action_name:
          "Phiên theo biểu giá, khoảng thời gian 18/07/2023 11:49 - 18/07/2023 13:20",
        balance: "26000.00",
        spent_sum: "0.00",
        start: "2023-07-18T11:49:00.700244+07:00",
        end: "2023-07-18T13:20:54.974846+07:00",
      },
      {
        action_name: "Số tiền thanh toán đơn hàng tại cửa hàng",
        balance: null,
        spent_sum: "24000.00",
        start: "2023-07-18T11:58:00.860402+07:00",
        end: "2023-07-18T11:58:00.860402+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "50000.00",
        spent_sum: "0.00",
        start: "2023-07-18T11:49:39.351422+07:00",
        end: "2023-07-18T11:49:39.351422+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-07-18T11:49:39.340134+07:00",
        end: "2023-07-18T11:49:39.340134+07:00",
      },
      {
        action_name: "Chuyển tiền vào tài khoản phụ",
        balance: "50000.00",
        spent_sum: "0.00",
        start: "2023-07-18T11:42:08.825733+07:00",
        end: "2023-07-18T11:42:08.825733+07:00",
      },
      {
        action_name: "Số dư",
        balance: null,
        spent_sum: "50000.00",
        start: "2023-07-18T11:42:08.794172+07:00",
        end: "2023-07-18T11:42:08.794172+07:00",
      },
    ];
    const priceActions = actions.filter(
      (x) =>
        x.action_name.includes("Phiên theo biểu giá") &&
        dayjs(x.start).isToday(),
    );

    let minutes = 0;
    priceActions.forEach((action) => {
      const { start, end } = action;
      if (end !== null) {
        const dateStart = dayjs(start);
        const dateEnd = dayjs(end);
        minutes += dateEnd.diff(dateStart, "minute");
      } else {
        const dateStart = dayjs(start);
        const dateEnd = dayjs();
        minutes += dateEnd.diff(dateStart, "minute");
      }
    });
    return NextResponse.json(minutes);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
