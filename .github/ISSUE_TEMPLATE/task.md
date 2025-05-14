name: ✅ Task
description: Track a small task or subtask
title: "[Task] "
labels: [task]
assignees: []

body:
  - type: markdown
    attributes:
      value: |
        ## ✅ Task

  - type: textarea
    id: task
    attributes:
      label: Task Description
      description: Describe what needs to be done.
      placeholder: Write a clear and concise task description.
    validations:
      required: true

  - type: textarea
    id: checklist
    attributes:
      label: Checklist (optional)
      description: Use a checklist if the task has multiple steps.
      placeholder: |
        - [ ] Step 1
        - [ ] Step 2
        - [ ] Done
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
