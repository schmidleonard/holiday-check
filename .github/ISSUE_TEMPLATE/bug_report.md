name: 🐛 Bug Report
description: Report something that isn't working correctly
title: "[Bug] "
labels: [bug]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        ## 🐛 Bug Report

  - type: textarea
    id: description
    attributes:
      label: Description
      description: What happened and what did you expect to happen?
      placeholder: Clearly describe the issue and expected behavior.
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: List the steps to trigger the bug.
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: Information about your environment.
      placeholder: |
        - OS: Windows/Linux/macOS
        - Browser: Chrome/Firefox
        - App Version: x.y.z
    validations:
      required: false

  - type: textarea
    id: logs
    attributes:
      label: Relevant Logs or Screenshots
      description: Paste any logs or screenshots that help explain the problem.
      placeholder: Drag and drop or paste...
    validations:
      required: false
