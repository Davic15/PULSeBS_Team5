TEAM 5 Retrospective
=====================================

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed :9 
- Number of stories done :8 
- Total points committed : 29
- Total points done : 26 
- Unit Tests passing: 22
- Code review completed
- Code present on VCS
- End-to-End tests performed: 10 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    11     |    -   |      27h  10m     |      35h        |
| _#1_   |    6     |    3   |    7h 20m       |        7h      |
| _#2_   |    7    |    3   |      6h      |        4h 30m      |
| _#3_   |    4     |    3   |     3h 20m       |      2h 20m        |
| _#4_   |    2     |    5   |      1h      |         1h 20m     |
| _#5_   |    4     |    2   |       4h 20m     |        2h 30m      |
| _#6_   |    4     |    5   |     5h 20m       |      4h 5m        |
| _#7_   |    4     |    3   |     3h 20m       |      1h 15m        |
| _#8_   |    3     |    2   |       2h     |       1h 30m       |
| _#9_   |    4     |    3   |      3h 20m      |         1h 55m     |
| _tot_  |    49     |   29     |      63h 10m      |    54h 30m       |
   

- Average hours per task : 1h 10m
- Standard deviation per task : 5h 5m
- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent from previous table= 1.16

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated:12h
  - Total hours spent: 4h 10m
  - Nr of automated unit test cases :22
  - Coverage (if available): not available
- E2E testing:
  - Total hours estimated: 4h
  - Total hours spent :2h 30m
- Code review 
  - Total hours estimated : 2h
  - Total hours spent: 1h 30m
- Technical Debt management:
  - Total hours estimated :1h
  - Total hours spent :50m
  - Hours estimated for remediation by SonarQube:40m
  - Hours spent on remediation :30m
  - debt ratio :0.1%
  - rating for each quality characteristic reported in SonarQube under "Measures" (reliability: A  , security: A, maintainability: A )
  


## ASSESSMENT

- What caused your errors in estimation (if any)?
  Errors were caused by the fact that we  took into account possible issues that could occur during coding,we were lucky and managed to work well without many problems but we ended-up overestimateing time to complete many tasks

- What lessons did you learn (both positive and negative) in this sprint?
  It is really important, when starting a project, to take time to discuss about implementation details together, expecially regarding db design and project structure. More importatly doing so not only focusing on current stories, but also taking into account future points and functionality to implement, in order to make it easier to be efficient on future sprints.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  We were able to better split up workload among team members focusing on each person skills and preference, we also improved tasks identification and ranking and also "pipelining" of developement.
  
- Which ones you were not able to achieve? Why?
  We weren't able to compute a value for coverage(because we couldn't get sonarcloud to run the tests) and to gather time dedicated to test and code review precisely, that's because we cannot find a way to clearly split coding and review as we usually do those things together. 

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  we should work a bit more on getting the test to work on sonarcloud looking for some documentation online and also be more careful with time tracking regarding testing

- One thing you are proud of as a Team!!
  we are proud of the fact that we managed to deliver a lot of stories in this sprint despite having fewer work hours compared to other groups