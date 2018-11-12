#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script does something.
"""

import csv
import matplotlib.pyplot as plt
import pandas as pd
import re

INPUT_CSV = 'input.csv'


def cleanup(dict_reader):
    """
    Deletes rows lacking information and removes surplus spaces from data.
    Takes a DictReader and its columns as input. Returns a list of dictionaries.
    """

    # extract column names
    columns = dict_reader.fieldnames

    # save all complete, and 'de-spaced' dictionaries in new list
    clean_rows = []
    for dict in dict_reader:
        row = {}
        info_complete = True

        # remove surplus spaces from data entries and check if they contain info
        for column in columns:
            row[column] = dict[column].strip()
            if not row[column] or row[column] == "unknown":
                info_complete = False

        # save rows with complete information
        if info_complete:
            clean_rows.append(row)

    return clean_rows


if __name__ == "__main__":

    with open(INPUT_CSV, 'r') as infile:

        # extract information from csv input file
        reader = csv.DictReader(infile)

        # clean data to only contain rows with full info and no surplus spaces
        rows = cleanup(reader)

        # preprocess data: convert needed data to floats/integers
        for row in rows:
            row["Pop. Density (per sq. mi.)"] \
            = float(re.sub(",", ".", row["Pop. Density (per sq. mi.)"]))
            row["Infant mortality (per 1000 births)"] \
            = float(re.sub(",", ".", row["Infant mortality (per 1000 births)"]))
            row["GDP ($ per capita) dollars"] \
            = int(row["GDP ($ per capita) dollars"][:-8])

        # for row in rows:
        #     print(row)

        # create pandas dataframe
        df = pd.DataFrame(rows)

        # calculate central tendency
        mean_gdp = df.loc[:, "GDP ($ per capita) dollars"].mean()
        median_gdp = df.loc[:, "GDP ($ per capita) dollars"].median()
        mode_gdp = df.loc[:, "GDP ($ per capita) dollars"].mode()
        std_gdp = df.loc[:, "GDP ($ per capita) dollars"].std()

        print(mean_gdp)
        print(median_gdp)
        print(mode_gdp)
        print(std_gdp)

        # find number of rows in gdp column
        nr_rows = df["GDP ($ per capita) dollars"].count()

        # plot histogram of gdp data
        hist = df.hist(bins = nr_rows, column = "GDP ($ per capita) dollars",
                       grid = False)

        # histogram layout
        plt.suptitle("GDP of several countries", fontsize=13, fontweight='bold')
        plt.title("By Maud van Boven", fontsize=10)
        plt.xlabel("GDP ($ per capita)")
        plt.ylabel("Frequency")
        plt.show()
