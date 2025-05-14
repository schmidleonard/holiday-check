name: 🚀 Feature Request
description: Suggest a new feature or improvement
title: "[Feature] "
labels: [enhancement]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        ## 🚀 Feature Request

  - type: textarea
    id: description
    attributes:
      label: Description
      description: What do you want to add or improve? Why is it useful?
      placeholder: A clear and concise description of the feature.
    validations:
      required: true

  - type: textarea
    id: acceptance
    attributes:
      label: Acceptance Criteria
      description: Define when this feature is considered complete.
      placeholder: |
        - [ ] It does X
        - [ ] It integrates with Y
        - [ ] It passes Z tests
    validations:
      required: false

  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Add any other context like mockups, screenshots, or links.
      placeholder: Any references or designs...
    validations:
      required: false

  - type: dropdown
    id: priority
    attributes:
      label: Priority
      options:
        - High
        - Medium
        - Low
      default: 1
    validations:
      required: false
