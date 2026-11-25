# Rondín

Web app to organize field surveys of commercial premises by groups and generate the final reports in one click.

A coordinator uploads an Excel file (one sheet per group), group leaders split the premises among their members,
members record each visit from their phone (status, annual registration number, photos), and the reports are
generated automatically.

## Roles

| Role        | Sees                              | Can do                                                        |
| ----------- | --------------------------------- | ------------------------------------------------------------- |
| Coordinator | All groups, premises and visits   | Upload Excel, create groups, assign leaders, consolidated report |
| Leader      | Only their group                  | Invite members, assign premises, group report                 |
| Member      | Only the premises assigned to them | Record visits                                                 |

Permissions are enforced in the database with Row Level Security, not only in the UI.
