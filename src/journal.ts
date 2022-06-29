#!/usr/bin/env node

import {CLI} from "./cli";

const journal = CLI.journal();
journal.parse();