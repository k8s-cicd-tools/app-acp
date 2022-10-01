#!/bin/bash
pulumi login
pulumi stack init dev --non-interactive
pulumi up -s dev --yes
