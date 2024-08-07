#!/usr/bin/env python3
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import os

""" Bot Configuration """


class DefaultConfig:
    """ Bot Configuration """

    PORT = 3978
    APP_ID = os.environ.get("MicrosoftAppId", "")
    APP_PASSWORD = os.environ.get("MicrosoftAppPassword", "")
    #APP_ID = os.environ.get("MicrosoftAppId", "00aeb01a-bda4-4362-b970-3f105e0ff056")
    #APP_PASSWORD = os.environ.get("MicrosoftAppPassword", "7f828462-ba51-401a-bd66-ae13ed9cee4b")
    APP_TYPE = os.environ.get("MicrosoftAppType", "MultiTenant")
    APP_TENANTID = os.environ.get("MicrosoftAppTenantId", "")
