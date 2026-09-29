# Appliance Energy Consumption Website: TV Energy Data Story

A three-page website that tells one story from the Australian Energy Rating television data: **screen size sets a TV's running cost, but star rating decides how far above or below the typical cost you land.**

Open `index.html` in a browser. There is no build step or server.

## Pages

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | The data story: three charts with explanatory text, a buying checklist and an FAQ accordion |
| Televisions | `televisions.html` | Running cost calculator using typical wattages from the data |
| About Us | `about.html` | Short project and data notes |

## Folder structure

```
index.html  televisions.html  about.html  README.md
assets/
  css/style.css
  js/main.js          footer year and FAQ accordion
  js/charts.js        the three Chart.js charts and their data tables
  js/calculator.js    running cost calculator
  js/data.js          summary numbers used by the charts (from data/*.csv)
  js/vendor/chart.umd.js   Chart.js 4.4.1, stored locally
  img/PowerIcon.png
data/
  tv_clean.csv                     cleaned data, one row per unique test result
  summary_by_size.csv              chart 1 and 2
  summary_55in_by_stars.csv        chart 3
  summary_55in_by_technology.csv   technology comparison in the text
```

## Data Story

### Audience

An Australian household choosing a new television. They are not technical, have limited time and will skim the page. They care about what a TV will cost to run and whether a bigger screen or a fancier technology is worth it. They may know the Energy Rating label but not how to use it.

### What they want to know

1. How much does screen size affect running cost?
2. If I fix the size, does it still matter which TV I pick?
3. What explains the difference between TVs of the same size: star rating or screen technology?

### Guidelines for the story

- Lead with the finding, not the method. The headline of each section states what the chart shows.
- Use dollars as well as kWh, because households think in bills.
- Compare TVs within one size wherever stars are involved, because stars are relative to size.
- Highlight the 55-inch TVs in every chart so the reader follows one thread. 55-inch is a common mid-size with 470 TVs in the data, enough to compare star ratings and technologies.
- State the assumptions (10 hours a day, 28.55 c/kWh) next to the numbers they affect.
- Provide each chart's data as a table for readers who prefer numbers or use a screen reader.

### Storyboard

1. **Hook:** "A 55-inch TV can use as much power as a 75-inch", with three headline numbers.
2. **Setup (chart 1):** larger screens cost more. Median energy use by size.
3. **Complication (chart 2):** at every size there is a wide range. The 55-inch range is 170 to 817 kWh a year.
4. **Resolution (chart 3):** stars explain the range, technology does not.
5. **Action:** a three-step buying checklist and a link to the calculator.

*Replace or extend this with your own storyboard from Miro, draw.io or PowerPoint, and add the image here.*

### Key findings

| Finding | Evidence |
| --- | --- |
| Median labelled use rises from 231 kWh (43 inch) to 768 kWh (85 inch) | `data/summary_by_size.csv` |
| Screen size and kWh have a correlation of about 0.86 | `data/tv_clean.csv` |
| 55-inch TVs range from 170 to 817 kWh a year | `data/summary_by_size.csv` |
| 55-inch TVs rated 6 stars or more have a median of 256 kWh, versus 596 kWh for 1 to 2.5 stars | `data/summary_55in_by_stars.csv` |
| 55-inch median kWh by technology: LCD 339, LED-backlit LCD 339, OLED 353 | `data/summary_55in_by_technology.csv` |

Dollar figures are kWh multiplied by 0.2855 dollars per kWh.

## About the data

### Data source

The Australian Government Energy Rating register of labelled televisions, published on data.gov.au ("Energy Rating Data for household appliances - Labelled Products", televisions resource). The file used is `tv_2026_09_28.csv` (28 September 2026), provided for the unit. It has 5,340 rows and 32 columns. An earlier version of the data (`tv_2026_02_15.csv`, 4,724 rows) was used for a first draft, and every figure was recalculated when the new file arrived.

The tariff of 28.55 cents per kWh is the average Australian tariff quoted in the Energy Rating retailer factsheet for TVs and monitors. It may be out of date, and the website tells users to replace it with their own rate.

### Data processing

1. **Kept only current registrations.** 25 rows have the status Superseded (replaced by a newer registration) and were removed. A further 291 approved rows are marked Unavailable, meaning they are no longer sold, and were removed because the audience is people buying a TV now. This leaves 5,024 rows.
2. **Removed repeated test results.** 2,157 of those rows repeat another row's test result under a different model number (for example, seven Kogan model numbers share one submission with identical specifications). Rows were de-duplicated on `Submit_ID`, leaving **2,867** unique test results. This stops products that were registered under many model numbers from being counted several times.
3. **Converted screen size.** The `screensize` column is in centimetres. It was divided by 2.54 to give inches, and rounded to a nominal size (for example 138.8 cm becomes 54.6 inches, which is a nominal 55 inches).
4. **Grouped sizes.** Charts use the common sizes 43, 50, 55, 65, 75 and 85 inches, each including TVs within one inch of the nominal size (85 includes 85 to 86 inches).
5. **Used `Star2` as the star rating.** The older `Star` column is empty for most rows. The new file has 28 rows with a `Star2` of 0 and a Star Rating Index of "-", which means no rating, not zero stars. All of them were already removed by the availability filter, and the code would treat them as missing anyway.
6. **Tidied brand names.** Brand names were trimmed and upper-cased because the same brand appears with different capitalisation (KOGAN, Kogan, kogan). Brand is not used in the charts. Some variants such as SAMSUNG and SAMSUNG ELECTRONICS remain separate.
7. **Grouped star ratings** into five bands (1 to 2.5, 3 to 3.5, 4 to 4.5, 5 to 5.5, 6 or more) for the 55-inch chart, because single half-star groups have very few TVs at the extremes. The top band is open-ended because the new data includes 55-inch TVs rated 8 stars, and a band ending at 7 would have dropped them.
8. **Calculated summaries** (count, minimum, median, maximum of `Labelled energy consumption (kWh/year)`) for each group.

Reproduce these steps in KNIME with: CSV Reader, Row Filter (SubmitStatus is Approved, Availability Status is Available), Duplicate Row Filter on `Submit_ID`, Math Formula for inches, Rule-based Row Filter for size bands, GroupBy (count, min, median, max), then a chart node. Compare your results with the `data/` files.

### Privacy

The data describes products, not people. It contains brand names, model numbers and registration details supplied by companies to a public government register. It contains no personal information. Product website columns were not used.

### Accuracy and limitations

- **Standard test, not real use.** Labelled energy use assumes 10 hours of use a day. Most households use less, so real costs are usually lower. The calculator page lets users enter their own hours.
- **Models, not sales.** Each unique test result counts once, whether the TV sells thousands or a handful. The medians describe the models on offer, not what Australians buy.
- **Self-reported results.** Manufacturers supply the test results. This project did not check them.
- **Small groups.** The lowest star band for 55-inch TVs has only 11 TVs, so that bar is indicative. The page says so.
- **Medians hide detail.** The range chart shows the spread, but the extremes are individual models and may be unusual.
- **Snapshot in time.** The file is dated 28 September 2026. The register changes as models are added or expire.
- **Availability is a judgement call.** Removing unavailable and superseded models suits a buying guide. Keeping them instead changes the medians by about 1 percent or less (for example the 55-inch median is 342 kWh instead of 346), and the findings stay the same.
- **Star ratings above 7.** A few TVs are rated 8 or 9 stars. The star bands treat 6 stars and above as one group, so differences between the highest ratings are not shown.
- **Wattage in the calculator** is the median on-mode power for each size. It excludes standby power and varies widely between models.
- **Tariff.** 28.55 c/kWh is an average from a factsheet and may not match a household's rate.

### Ethics

- The charts compare products, not brands, and no brand is named as best or worst. Naming brands from a registry of models could unfairly affect a company's reputation without sales data or context.
- Dollar figures are labelled as estimates under label conditions, so they are not presented as a prediction of anyone's bill.
- The story does not tell people to buy a particular TV. It explains how to read the label.
- Axes start at zero on the bar charts so the differences are not exaggerated.
- Charts have text descriptions and data tables so the information does not depend on colour or sight.

## AI Declaration

Claude (Anthropic) was used to help with this project, including exploring the data set, suggesting the cleaning steps and story angle, and writing the website code and README text. *Edit this to match what you did yourself.* For example: I ran the analysis in KNIME, checked the numbers against `data/`, chose the audience and questions, and changed the wording.

### Generative AI Reflection

**Tool used:** Claude (Anthropic).

**What I used it for:** *Fill in.*

**What I changed or adapted:** *Fill in. For example: replaced the placeholder logo, checked figures in KNIME, rewrote text in my own words.*

**What I learned:** *Fill in, in your own words. For example: why duplicate rows must be removed before summarising, and why star ratings can only be compared within a size.*

**Limitations or issues:** *Fill in. For example: the numbers had to be checked against my own workflow, and the generated design needed adjusting.*
