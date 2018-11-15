#!/usr/bin/env python
# Name: Maud van Boven
# Student number: 12474673
"""
This script loads in a CSV file, preprocesses and analyzes the read in data, and
creates a histogram, boxplot, and .json file.
"""

import csv
import json
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import re

INPUT_CSV = 'input.csv'
OUTPUT_JSON = 'output.json'


def boxplot(df, column, title):
    """
    Plots and shows a boxplot of given column from given data frame, with given
    title.
    """

    # plot boxplot of given column
    df.boxplot(column)

    # layout
    plt.suptitle(title, fontsize=13, fontweight='bold')
    plt.title("By Maud van Boven", fontsize=10)

    plt.show()
    plt.clf()


def central_tendency(df, columns):
    """
    Computes central tendency of given columns and returns it in a dictionary.
    """

    # calculate central tendency of given columns and save in a dictionary
    ct = {}
    for column in columns:
        mean = df[column].mean()
        median = df[column].median()
        mode = df[column].mode()[0]
        ct[column] = {"mean": mean, "median": median, "mode": mode}

    return ct


def histogram(df, column, title, xlabel):
    """
    Plots and shows a histogram of given column from given data frame, with
    given layout specifications.
    """

    # plot histogram of given column
    df.hist(bins=df[column].count(), column=column, grid=False)

    # layout
    plt.suptitle(title, fontsize=13, fontweight='bold')
    plt.title("By Maud van Boven", fontsize=10)
    plt.xlabel(xlabel)
    plt.ylabel("Frequency")

    plt.show()
    plt.clf()


def preprocess(df):
    """
    Preprocesses given data frame. Returns preprocessed data frame.
    """

    # remove surplus spaces region, extract numbers gdp, replace unknown -> NaN
    df[reg] = df[reg].str.strip()
    df[gdp] = df[gdp].str.extract('(\d+)')
    df = df.replace("unknown", np.NaN)

    # replace , with . (needed for floats), convert numeric cols to numeric data
    for col in df.select_dtypes([np.object]).columns:
        df[col] = df[col].str.replace(",", ".")
        df[col] = pd.to_numeric(df[col], errors='ignore')

    # replace extreme outliers (out range -10std to +10std from mean) with NaN
    for col in df.select_dtypes(include="number"):
        df.loc[abs(df[col] - df[col].mean()) > 10 * df[col].std()] = np.NaN

    return df


if __name__ == "__main__":

    with open(INPUT_CSV, 'r') as infile:

        # create pandas data frame from csv data in infile
        df = pd.read_csv(infile, index_col="Country")

        infile.close()

    # remember columns of interest
    country = "Country"
    reg = "Region"
    pop_dens = "Pop. Density (per sq. mi.)"
    inf_mor = "Infant mortality (per 1000 births)"
    gdp = "GDP ($ per capita) dollars"

    # preprocess data data frame
    df = preprocess(df)

    # compute and print central tendency of GDP data
    cen_ten = central_tendency(df, [gdp])
    print("\n>", gdp, "central tendency")
    for ct in cen_ten[gdp]:
        print(f"{ct}".ljust(6) + f"{round(cen_ten[gdp][ct], 2)}".rjust(10))

    # plot histogram of GDP data
    histogram(df, gdp, "GDP of Several Countries", "GDP ($ per capita)")

    # compute and print five number summary of infant mortality data
    summary = df[inf_mor].describe()[["min", "25%", "50%", "75%", "max"]]
    print("\n>", inf_mor, "five number summary")
    print(summary.to_string(header=None))

    # plot boxplot of infant mortality data
    boxplot(df, inf_mor, "Infant Mortality in Several Countries")

    # write columns of interest to json file, replacing NaN with None
    with open(OUTPUT_JSON, 'w') as outfile:
        json.dump(df[[reg, pop_dens, inf_mor, gdp]].
                  where((pd.notnull(df)), None).T.to_dict(), outfile, indent=4)
