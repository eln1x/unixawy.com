---
title: "Automatic flight ticket script"
date: 2014-12-04T18:37:19+00:00
url: "/automatic-flight-ticket-script/"
draft: false
description: "python script to demonstrate the splinter library this script keep searching till finding a ticket and book it :) rest and wait your reservation number"
categories: ["blog", "Python", "Web"]
---

python script  to demonstrate  the splinter library

this script keep searching till finding a ticket and book it  :)

rest and wait your reservation number

```python
#!/usr/bin/env python
from splinter import Browser
from time import sleep
from sys import exit

def checkoneway():
	browser = Browser()
	url = 'http://www.bookonline.saudiairlines.com'
	browser.visit(url)
	browser.find_by_name('TRIP_TYPE')[2].click()  # one way trip
	browser.fill('WDS_B_LOCATION_1_DISPLAY' , 'Dammam') #from 
	browser.fill('WDS_E_LOCATION_1_DISPLAY' , 'Riyadh') #to
	browser.select('onlineCalendar_0Day','09')  #day to reave
	browser.select('onlineCalendar_0MonthYear','082014')  #month year of travel 
	browser.select('CABIN','E')  #travel class
	browser.check('IS_FLEXIBLE')  #checling flexable 
	browser.select('WDS_NB_ADT','2')  # how many travels  
	browser.select('WDS_NB_CHD','2')  # how many childenrs
	browser.find_by_id("onlineSubmit").click()
	busy = "Flights out are not available for the date / time specified. However, you can see flights for alternate days by selecting other dates below"
	while browser.is_text_present(busy):
		browser.quit()
		checkoneway()
	if browser.is_text_present("Sorry, but your session has timed out. Please start again"):
		browser.quit()
		checkoneway()
	
	browser.find_by_id("b0FO0_PREMIUMEDRadioEl")[0].click()

	#form submition
	browser.execute_script("theOcupForm.submit()")

	#passenger 1
	browser.select('TITLE_1','MR')
	browser.fill('FIRST_NAME_1','Ahmed') #first name
	browser.fill('LAST_NAME_1','Ibrahim') #lastname
	browser.select("NATIONALITY_1",'SA')

	#passenger2
	browser.select('TITLE_2','MS')
	browser.fill('FIRST_NAME_2','Ahmed')  #first name
	browser.fill('LAST_NAME_2','Ibrahim') #lastname
	browser.select("NATIONALITY_2",'SA')

	#kid 1 info
	browser.select('TITLE_3','MTR')  #childern male
	browser.fill('FIRST_NAME_3','Omar')  #first name
	browser.fill('LAST_NAME_3','Ezz') #last namr
	browser.select("NATIONALITY_3",'SA') #nationality 
	browser.select("dateOfBirthDay3", '10')  
	browser.select("dateOfBirthMonth3", '05')
	browser.select("dateOfBirthYear3", '2012')	

	#kid 2 info
	browser.select('TITLE_4','MISS')  #childern female
	browser.fill('FIRST_NAME_4','Omnia') #first name
	browser.fill('LAST_NAME_4','Ezz') #last name
	browser.select("NATIONALITY_4",'SA')
	browser.select("dateOfBirthDay4", '09')
	browser.select("dateOfBirthMonth4", '05')
	browser.select("dateOfBirthYear4", '2012')

	#phone and email confirmation
	browser.select("TEL_1_TYPE",'MOB')
	browser.select("TEL_1_COUNTRY_CODE",'+966')
	browser.fill("TEL_1_NUMBER","01002020794")
	browser.select("TEL_2_TYPE","RES")
	browser.select("TEL_2_COUNTRY_CODE",'+20')
	browser.fill("TEL_2_NUMBER","01000000001")
	browser.fill("CONTACT_POINT_EMAIL_1",'root@mail.com')
	browser.fill("WDS_CONFIRM_EMAIL_1",'root@mail.com')
	browser.check("WDS_SAVE_COOKIE")
	browser.execute_script("theALPIForm.submit()")
	browser.execute_script("thePURCForm.selectPaymentType('Sadad')")
	browser.check("WDS_CONDITIONS")
	browser.execute_script("thePURCForm.submit()")

	data = str(browser.html)
	for line in data.readlines():
		if "recordLocator" in line:
			print line.split("recordLocator")[1].replace("</span>", "").replace("\">","")

if __name__ == "__main__":

	checkoneway()
```
