## Overview

The recommendation component shows recommendations for various use cases, such as bundle options, stock levels, product measurements, lost/damaged shipments and so on. The user has the option of assigning different statuses to these recommendations. It is also possible to open the associated cta to obtain even more detailed information about the recommendation.

- mongodb collection: recommendations

## Maintainers

- Lead-Maintainer: Fabian Gruber
- Co-Maintainer: Saulo Falcão

## Components

### recommendations

- `recommendations.component`: fetch all the necessary data and renders all usecases

### usecase

- includes the components for each usecase
- the .component files are the main components for each usecase. the .item files are the single recommendations each this usecase.

### components

- `BundleSkuComponent`: Component to set a sku for a new bundle (product bundles and quantity bundles)
- `UsecaseDetails`: Grid component that renders the different values of each usecase
- `Dropdown`: Dropdown to change the status of the recommendation
- `RecommendationsHeader`: Header of each usecase that shows name, savings and progress of the usecase
- `Instructions`: Shows instructions of the usecase
- `Messages`: Handles Messages between user and the automation account
- `ProductInfosGridItem`: Grid component that shows details about the product (name, image, sku, asin, fnsku)
- `LinearProgressWithLabel`: Shows the progress of completed recommendations

### queries

- `useRecommendations.query`: fetch recommendation data for each usecase

### mutation

- `use-update-bundle-sku.mutation`: saves the new bundle sku in the recommendation document to calculate the savings of the new bundle
- `use-update-recommendation-messages-mark-all-as-read.mutation`: marks all messages of a specific recommendation as read for the logged-in user, after the user opens the message histories
- `use-update-recommendation-messages.mutation`: saves the message, uploads, reply_required and with_cta in the messages collection
- `use-update-recommendations-case-reimbursement-id.mutation`: saves the case-/reimbursement_id in the recommendation document
- `use-update-recommendations-missing-inbound-quantity-send.mutation`: saves the actual number of products shipped the recommendation document
- `use-update-recommendations-size-change-higher-confirm-wrong.mutation`: saves confirm_wrong_measurement value in the document
- `use-update-recommendations-status.mutation`: saves the new status of a specific recommendation and updates the corresponding cta

## Tasks / Improvements / Comments

- move use-update-toggle-status.mutation to automations folder
- add filters to show only specific recommendations
