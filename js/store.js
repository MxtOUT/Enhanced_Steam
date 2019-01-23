
let AgeCheck = (function(){

    let self = {};

    self.sendVerification = function(){
        if (!SyncedStorage.get("send_age_info", true)) { return; }

        let ageYearNode = document.querySelector("#ageYear");
        if (ageYearNode) {
            let myYear = Math.floor(Math.random()*75)+10;
            ageYearNode.value = "19" + myYear;
            document.querySelector(".btnv6_blue_hoverfade").click();
        } else {
            let btn = document.querySelector(".agegate_text_container.btns a");
            if (btn && btn.getAttribute("href") === "#") {
                btn.click();
            }
        }

        let continueNode = document.querySelector("#age_gate_btn_continue");
        if (continueNode) {
            continueNode.click();
        }
    };

    return self;
})();


let StorePageClass = (function(){

    function StorePageClass() {

    }

    StorePageClass.prototype.isAppPage = function() {
        return /^\/app\/\d+/.test(window.location.pathname);
    };

    StorePageClass.prototype.isSubPage = function() {
        return /^\/sub\/\d+/.test(window.location.pathname);
    };

    StorePageClass.prototype.isDlc = function() {
        return document.querySelector("div.game_area_dlc_bubble") ? true : false;
    };

    StorePageClass.prototype.isVideo = function() {
        return document.querySelector(".game_area_purchase_game .streamingvideo") ? true : false;
    };

    StorePageClass.prototype.hasCards = function() {
        return document.querySelector(".icon img[src$='/ico_cards.png'") ? true : false;
    };

    StorePageClass.prototype.hasAchievements = function(){
        return document.querySelector("#achievement_block") ? true : false;
    };

    StorePageClass.prototype.getAllSubids = function() {
        let result = [];
        let nodes = document.querySelectorAll("input[name=subid]");
        for (let i=0, len=nodes.length; i<len; i++) {
            result.push(nodes[i].value);
        }
        return result;
    };


    StorePageClass.prototype.addDrmWarnings = function() {
        if (!SyncedStorage.get("showdrm", true)) { return; }

        let gfwl, uplay, securom, tages, stardock, rockstar, kalypso, denuvo, drm;

        let text = "";
        let nodes = document.querySelectorAll("#game_area_description, .game_area_sys_req, #game_area_legal, .game_details, .DRM_notice");
        for (let i=0, len=nodes.length; i<len; i++) {
            let node = nodes[i];
            text += node.innerHTML;
        }

        // Games for Windows Live detection
        if (text.toUpperCase().indexOf("GAMES FOR WINDOWS LIVE") > 0) { gfwl = true; }
        else if (text.toUpperCase().indexOf("GAMES FOR WINDOWS - LIVE") > 0) { gfwl = true; }
        else if (text.indexOf("Online play requires log-in to Games For Windows") > 0) { gfwl = true; }
        else if (text.indexOf("INSTALLATION OF THE GAMES FOR WINDOWS LIVE SOFTWARE") > 0) { gfwl = true; }
        else if (text.indexOf("Multiplayer play and other LIVE features included at no charge") > 0) { gfwl = true; }
        else if (text.indexOf("www.gamesforwindows.com/live") > 0) { gfwl = true; }

        // Ubisoft Uplay detection
        if (text.toUpperCase().indexOf("CREATION OF A UBISOFT ACCOUNT") > 0) { uplay = true; }
        else if (text.match(/\buplay/i) && !text.match(/\btuplaydinprosessori/i)) { uplay = true; }

        // Securom detection
        if (text.toUpperCase().indexOf("SECUROM") > 0) { securom = true; }

        // Tages detection
        if (text.match(/\btages\b/i)) { tages = true; }
        else if (text.match(/angebote des tages/i)) { tages = false; }
        else if (text.match(/\bsolidshield\b/i)) { tages = true; }

        // Stardock account detection
        if (text.indexOf("Stardock account") > 0) { stardock = true; }

        // Rockstar social club detection
        if (text.indexOf("Rockstar Social Club") > 0) { rockstar = true; }
        else if (text.indexOf("Rockstar Games Social Club") > 0) { rockstar = true; }

        // Kalypso Launcher detection
        if (text.indexOf("Requires a Kalypso account") > 0) { kalypso = true; }

        // Denuvo Antitamper detection
        if (text.match(/\bdenuvo\b/i)) { denuvo = true; }

        // Detect other DRM
        if (text.indexOf("3rd-party DRM") > 0) { drm = true; }
        else if (text.match(/No (3rd|third)(-| )party DRM/i)) { drm = false; }

        let drmString = "(";
        if (gfwl) { drmString += 'Games for Windows Live, '; drm = true; }
        if (uplay) { drmString += 'Ubisoft Uplay, '; drm = true; }
        if (securom) { drmString += 'SecuROM, '; drm = true; }
        if (tages) { drmString += 'Tages, '; drm = true; }
        if (stardock) { drmString += 'Stardock Account Required, '; drm = true; }
        if (rockstar) { drmString += 'Rockstar Social Club, '; drm = true; }
        if (kalypso) { drmString += "Kalypso Launcher, "; drm = true; }
        if (denuvo) { drmString += "Denuvo Anti-tamper, "; drm = true; }

        if (drmString === "(") {
            drmString = "";
        } else {
            drmString = drmString.substring(0, drmString.length - 2);
            drmString += ")";
        }

        // Prevent false-positives
        if (this.isAppPage() && this.appid === 21690) { drm = false; } // Resident Evil 5, at Capcom's request

        if (drm) {
            let stringType = this.isAppPage() ? Localization.str.drm_third_party : Localization.str.drm_third_party_sub;

            let node = document.querySelector("#game_area_purchase .game_area_description_bodylabel");
            if (node) {
                node.insertAdjacentHTML("afterend", '<div class="game_area_already_owned es_drm_warning"><span>' + stringType + ' ' + drmString + '</span></div>')
            } else {
                document.querySelector("#game_area_purchase").insertAdjacentHTML("afterbegin", '<div class="game_area_already_owned es_drm_warning"><span>' + stringType + ' ' + drmString + '</span></div>');
            }
        }
    };

    StorePageClass.prototype.addPrices = function() {
        if (!SyncedStorage.get("showlowestprice", true)) { return; }

        let apiParams = {};

        if (!SyncedStorage.get("showallstores", true) && SyncedStorage.get("stores", []).length > 0) {
            apiParams.stores = SyncedStorage.get("stores", []).join(",");
        }

        let cc = User.getCountry();
        if (cc) {
            apiParams.cc = cc;
        }

        let subids = [];
        let nodes = document.querySelectorAll("input[name=subid]");
        for (let i=0, len=nodes.length; i<len; i++) {
            let node = nodes[i];
            subids.push(node.value);
        }
        apiParams.subs = subids.join(",");

        let bundleids = [];
        nodes = document.querySelectorAll("[data-ds-bundleid]");
        for (let i=0, len=nodes.length; i<len; i++) {
            let node = nodes[i];
            bundleids.push(node.dataset['dsBundleid']);
        }
        apiParams.bundleids = bundleids.join(",");

        if (SyncedStorage.get("showlowestpricecoupon", true)) {
            apiParams.coupon = true;
        }

        if (!apiParams.subs && !apiParams.bundleids) { return; }

        Request.getApi("v01/prices", apiParams).then(response => {
            if (!response || response.result !== "success") { return; }

            let bundles = [];

            for (let gameid in response.data.data) {
                if (!response.data.data.hasOwnProperty(gameid)) { continue; }

                let a = gameid.split("/");
                let type = a[0];
                let id = a[1];
                let meta = response.data['.meta'];
                let info = response.data.data[gameid];

                let activates = "";
                let line1 = "";
                let line2 = "";
                let line3 = "";
                let html;

                // "Lowest Price"
                if (info['price']) {
                    if (info['price']['drm'] === "steam" && info['price']['store'] !== "Steam") {
                        activates = "(<b>" + Localization.str.activates + "</b>)";
                    }

                    let infoUrl = BrowserHelper.escapeHTML(info["urls"]["info"].toString());
                    let priceUrl = BrowserHelper.escapeHTML(info["price"]["url"].toString());
                    let store = BrowserHelper.escapeHTML(info["price"]["store"].toString());

                    let lowest;
                    let voucherStr = "";
                    if (SyncedStorage.get("showlowetpricecoupon", true) && info['price']['price_voucher']) {
                        lowest = new Price(info['price']['price_voucher'], meta['currency']);
                        let voucher = BrowserHelper.escapeHTML(info['price']['voucher']);
                        voucherStr = `${Localization.str.after_coupon} <b>${voucher}</b>`;
                    } else {
                        lowest = new Price(info['price']['price'], meta['currency']);
                    }

                    let lowestStr = Localization.str.lowest_price_format
                        .replace("__price__", lowest.toString())
                        .replace("__store__", `<a href="${priceUrl}" target="_blank">${store}</a>`)

                    line1 = `${Localization.str.lowest_price}: 
                             ${lowestStr} ${voucherStr} ${activates}
                             (<a href="${infoUrl}" target="_blank">${Localization.str.info}</a>)`;
                }

                // "Historical Low"
                if (info["lowest"]) {
                    let historical = new Price(info['lowest']['price'], meta['currency']);
                    let recorded = new Date(info["lowest"]["recorded"]*1000);

                    let historicalStr = Localization.str.historical_low_format
                        .replace("__price__", historical.toString())
                        .replace("__store__", BrowserHelper.escapeHTML(info['lowest']['store']))
                        .replace("__date__", recorded.toLocaleDateString());

                    let url = BrowserHelper.escapeHTML(info['urls']['history']);

                    line2 = `${Localization.str.historical_low}: ${historicalStr} (<a href="${url}" target="_blank">${Localization.str.info}</a>)`;
                }

                let chartImg = ExtensionLayer.getLocalUrl("img/line_chart.png");
                html = `<div class='es_lowest_price' id='es_price_${id}'><div class='gift_icon' id='es_line_chart_${id}'><img src='${chartImg}'></div>`;

                // "Number of times this game has been in a bundle"
                if (info["bundles"]["count"] > 0) {
                    line3 = `${Localization.str.bundle.bundle_count}: ${info['bundles']['count']}`;
                    let bundlesUrl = BrowserHelper.escapeHTML(info["urls"]["bundles"] || info["urls"]["bundle_history"]);
                    if (typeof bundles_url === "string" && bundles_url.length > 0) {
                        line3 += ` (<a href="${bundlesUrl}" target="_blank">${Localization.str.info}</a>)`;
                    }
                }

                if (line1 || line2) {
                    let node;
                    let placement = "afterbegin";
                    if (type === "sub") {
                        node = document.querySelector("input[name=subid][value='"+id+"']").parentNode.parentNode.parentNode;
                    } else if (type === "bundle") {
                        node = document.querySelector(".game_area_purchase_game_wrapper[data-ds-bundleid='"+id+"']");
                        if (!node) {
                            node = document.querySelector(".game_area_purchase_game[data-ds-bundleid='"+id+"']");
                            placement = "beforebegin";
                        }
                    }

                    node.insertAdjacentHTML(placement, html + "<div>" + line1 + "</div><div>" + line2 + "</div>" + line3);
                    document.querySelector("#es_line_chart_"+id).style.top = ((document.querySelector("#es_price_"+id).offsetHeight - 20) / 2) + "px";
                }

                // add bundles
                if (info["bundles"]["live"].length > 0) {
                    let length = info["bundles"]["live"].length;
                    for (let i = 0; i < length; i++) {
                        let bundle = info["bundles"]["live"][i];
                        let endDate;
                        if (bundle["expiry"]) {
                            endDate = new Date(bundle["expiry"]*1000);
                        }

                        let currentDate = new Date().getTime();
                        if (endDate && currentDate > endDate) { continue; }

                        let bundle_normalized = JSON.stringify({
                            page:  bundle.page || "",
                            title: bundle.title || "",
                            url:   bundle.url || "",
                            tiers: (function() {
                                let tiers = [];
                                for (let tier in bundle.tiers) {
                                    tiers.push((bundle.tiers[tier].games || []).sort());
                                }
                                return tiers;
                            })()
                        });

                        if (bundles.indexOf(bundle_normalized) >= 0) { continue; }
                        bundles.push(bundle_normalized);

                        let purchase = "";
                        if (bundle.page) {
                            let bundlePage = Localization.str.buy_package.replace("__package__", bundle.page + ' ' + bundle.title);
                            purchase = `<div class="game_area_purchase_game"><div class="game_area_purchase_platform"></div><h1>${bundlePage}</h1>`;
                        } else {
                            let bundleTitle = Localization.str.buy_package.replace("__package__", bundle.title);
                            purchase = `<div class="game_area_purchase_game_wrapper"><div class="game_area_purchase_game"></div><div class="game_area_purchase_platform"></div><h1>${bundleTitle}</h1>`;
                        }

                        if (endDate) {
                            purchase += `<p class="game_purchase_discount_countdown">${Localization.str.bundle.offer_ends} ${endDate}</p>`;
                        }

                        purchase += '<p class="package_contents">';

                        let bundlePrice;
                        let appName = this.appName;

                        for (let t=0; t<bundle.tiers.length; t++) {
                            let tier = bundle.tiers[t];
                            let tierNum = t + 1;

                            purchase += '<b>';
                            if (bundle.tiers.length > 1) {
                                let tierName = tier.note || Localization.str.bundle.tier.replace("__num__", tierNum);
                                let tierPrice = new Price(tier.price, meta['currency']).toString();

                                purchase += Localization.str.bundle.tier_includes.replace("__tier__", tierName).replace("__price__", tierPrice).replace("__num__", tier.games.length);
                            } else {
                                purchase += Localization.str.bundle.includes.replace("__num__", tier.games.length);
                            }
                            purchase += ':</b> ';

                            let gameList = tier.games.join(", ");
                            if (gameList.includes(appName)) {
                                purchase += gameList.replace(appName, "<u>"+appName+"</u>");
                                bundlePrice = tier.price;
                            } else {
                                purchase += gameList;
                            }

                            purchase += "<br>";
                        }

                        purchase += "</p>";
                        purchase += `<div class="game_purchase_action">
                                         <div class="game_purchase_action_bg">
                                             <div class="btn_addtocart btn_packageinfo">
                                                 <a class="btnv6_blue_blue_innerfade btn_medium" href="${bundle.details}" target="_blank">
                                                     <span>${Localization.str.bundle.info}</span>
                                                 </a>
                                             </div>
                                         </div>`;

                        purchase += '<div class="game_purchase_action_bg">';
                        if (bundlePrice && bundlePrice > 0) {
                            purchase += '<div class="game_purchase_price price" itemprop="price">';
                            purchase += (new Price(bundlePrice, meta['currency'])).toString();
                        }
                        purchase += '</div>';

                        purchase += '<div class="btn_addtocart">';
                        purchase += '<a class="btnv6_green_white_innerfade btn_medium" href="' + bundle["url"] + '" target="_blank">';
                        purchase += '<span>' + Localization.str.buy + '</span>';
                        purchase += '</a></div></div></div></div>';

                        document.querySelector("#game_area_purchase")
                            .insertAdjacentHTML("afterend", "<h2 class='gradientbg'>" + Localization.str.bundle.header + " <img src='http://store.steampowered.com/public/images/v5/ico_external_link.gif' border='0' align='bottom'></h2>" + purchase);
                    }
                }
            }
        });
    };

    StorePageClass.prototype.addSteamDb = function(type) {
        if (!SyncedStorage.get("showsteamdb", true)) { return; }

        let bgUrl = ExtensionLayer.getLocalUrl("img/steamdb_store.png");

        // TODO this should be refactored elsewhere probably
        switch (type) {
            case "app": {
                let cls = "steamdb_ico";
                let url = "//steamdb.info/app/" + this.appid;
                let str = Localization.str.view_in + ' Steam Database';

                document.querySelector("#ReportAppBtn").parentNode.insertAdjacentHTML("afterbegin",
                    `<a class="btnv6_blue_hoverfade btn_medium ${cls}" target="_blank" href="${url}" style="display: block; margin-bottom: 6px;">
                        <span><i class="ico16"></i>&nbsp;&nbsp; ${str}</span></a>`);
            }
                break;
            case "sub": {
                let cls = "steamdb_ico";
                let url = "//steamdb.info/sub/" + this.appid;
                let str = Localization.str.view_in + ' Steam Database';

                document.querySelector(".share").parentNode.insertAdjacentHTML("afterbegin",
                    `<a class="btnv6_blue_hoverfade btn_medium ${cls}" target="_blank" href="${url}" style="display: block; margin-bottom: 6px;">
                        <span><i class="ico16"></i>&nbsp;&nbsp; ${str}</span></a>`);
            }
                break;
            case "bundle": {
                let cls = "steamdb_ico";
                let url = "//steamdb.info/bundle/" + this.appid;
                let str = Localization.str.view_in + ' Steam Database';

                let node = document.querySelector(".share");
                if (!node) {
                    node = document.querySelector(".rightcol .game_details");
                }
                node.parentNode.insertAdjacentHTML("afterbegin",
                    `<a class="btnv6_blue_hoverfade btn_medium ${cls}" target="_blank" href="${url}" style="display: block; margin-bottom: 6px;">
                            <span><i class="ico16"></i>&nbsp;&nbsp; ${str}</span></a>`);
            }
                break;
            case "gamehub":
                document.querySelector(".apphub_OtherSiteInfo").insertAdjacentHTML("beforeend",
                    `<a class="btnv6_blue_hoverfade btn_medium steamdb_ico" target="_blank" href="//steamdb.info/app/${this.appid}/"><span><i class="ico16" style="background-image:url('${bgUrl}')"></i>&nbsp; Steam Database</span></a>`);
                break;
            case "gamegroup":
                document.querySelector("#rightActionBlock").insertAdjacentHTML("beforeend",
                    `<div class="actionItemIcon"><img src="${bgUrl}" width="16" height="16" alt=""></div><a class="linkActionMinor" target="_blank" href="//steamdb.info/app/' + appid + '/">${Localization.str.view_in} Steam Database</a>`);
                break;
        }
    };

    StorePageClass.prototype.showRegionalPricing = function(type) {
        let showRegionalPrice = SyncedStorage.get("showregionalprice", "mouse");
        if (showRegionalPrice === "off") { return; }

        let countries = SyncedStorage.get("regional_countries", ["us", "gb", "fr", "ru", "br", "au", "jp"]);
        if (!countries || countries.length === 0) { return; }

        let localCountry = User.getCountry().toLowerCase();
        if (countries.indexOf(localCountry) === -1) {
            countries.push(localCountry);
        }

        let subids = this.getAllSubids();
        subids.forEach(subid => {
            if (!subid) { return; }
            let promises = [];

            let prices = {};

            countries.forEach(country => {

                let promise = Request.getJson("//store.steampowered.com/api/packagedetails/?packageids="+subid+"&cc="+country).then(result => {
                    if (!result || !result[subid] || !result[subid].success) { return; }
                    prices[country] = result[subid].data.price;
                });
                promises.push(promise);
            });

            Promise.all(promises).then(result => {

                let node = document.querySelector("input[name=subid][value='"+subid+"']")
                    .closest(".game_area_purchase_game_wrapper,#game_area_purchase")
                    .querySelector(".game_purchase_action");

                let priceLocal = new Price(prices[User.getCountry().toLowerCase()].final / 100);

                let pricingDiv = document.createElement("div");
                pricingDiv.classList.add("es_regional_container");
                pricingDiv.classList.add("es_regional_" + (type || "app"));

                if (showRegionalPrice === "mouse") {
                    pricingDiv.innerHTML += '<div class="miniprofile_arrow right" style="position: absolute; top: 12px; right: -8px;"></div>';
                }

                countries.forEach(country => {
                    let apiPrice = prices[country];
                    let html = "";

                    if (apiPrice) {
                        let priceUser = new Price(apiPrice.final / 100, apiPrice.currency);
                        let priceRegion = new Price(apiPrice.final / 100, apiPrice.currency, false);

                        let percentageIndicator = "equal";
                        let percentage = (((priceUser.value / priceLocal.value) * 100) - 100).toFixed(2);

                        if (percentage < 0) {
                            percentage = Math.abs(percentage);
                            percentageIndicator = "lower";
                        } else if (percentage > 0) {
                            percentageIndicator = "higher";
                        }

                        html =
                            `<div class="es_regional_price es_flag es_flag_${country}">
                                ${priceRegion}
                                <span class="es_regional_converted">(${priceUser})</span>
                                <span class="es_percentage es_percentage_${percentageIndicator}">${percentage}%</span>
                            </div>`;
                    } else {
                        html =
                            `<div class="es_regional_price es_flag es_flag_${country}">
                                <span class="es_regional_unavailable">${Localization.str.region_unavailable}</span>
                            </div>`;
                    }

                    pricingDiv.innerHTML += html;
                });

                let purchaseArea = node.closest(".game_area_purchase_game");
                purchaseArea.classList.add("es_regional_prices");

                if (showRegionalPrice === "always") {
                    node.insertAdjacentElement("beforebegin", pricingDiv);
                    purchaseArea.classList.add("es_regional_always");
                } else {
                    node.querySelector(".price").insertAdjacentElement("afterend", pricingDiv);
                    purchaseArea.classList.add("es_regional_onmouse");

                    if (!SyncedStorage.get("regional_hideworld", false)) {
                        node.querySelector(".price").classList.add("es_regional_icon")
                    }
                }
            })
        });
    };

    return StorePageClass;
})();


let SubPageClass = (function() {

    let Super = StorePageClass;

    function SubPageClass(url) {
        Super.call(this);

        this.subid = GameId.getSubid(url);

        this.addDrmWarnings();
        this.addPrices();
        this.addSteamDb("sub");
        this.showRegionalPricing("sub");
        this.subscriptionSavingsCheck();
    }
    SubPageClass.prototype = Object.create(Super.prototype);
    SubPageClass.prototype.constructor = SubPageClass;

    SubPageClass.prototype.subscriptionSavingsCheck = function() {
        setTimeout(function() {
            let notOwnedTotalPrice = new Price(0);

            let nodes = document.querySelectorAll(".tab_idem");
            for (let i=0, len=nodes.length; i<len; i++) {
                let node = nodes[i];

                let priceContainer = node.querySelector(".discount_final_price").textContent.trim();
                if (!priceContainer) { continue; }

                let price = Price.parseFromString(priceContainer, false);
                if (price) {
                    notOwnedTotalPrice.value += price.value;
                }
            }


            let priceNodes = document.querySelectorAll(".package_totals_area .price");
            let packagePrice = Price.parseFromString(priceNodes[priceNodes.length-1].textContent);
            if (!packagePrice) { return; }

            notOwnedTotalPrice.value -= packagePrice.value;

            if (!document.querySelector("#package_savings_bar")) {
                document.querySelector(".package_totals_area")
                    .insertAdjacentHTML("beforeend", "<div id='package_savings_bar'><div class='savings'></div><div class='message'>" + Localization.str.bundle_saving_text + "</div></div>");
            }

            let style = (notOwnedTotalPrice.value < 0 ? " style='color:red'" : "");
            let html = `<div class="savings"${style}>${notOwnedTotalPrice}</div>`;

            let savingsNode = document.querySelector(".savings");
            savingsNode.insertAdjacentHTML("beforebegin", html);
            savingsNode.remove();
        }, 500); // why is this here?
    };

    return SubPageClass;
})();


let BundlePageClass = (function(){

    let Super = StorePageClass;

    function BundlePageClass(url) {
        Super.call(this);

        this.bundleid = GameId.getSubid(url);

        this.addDrmWarnings();
        this.addPrices();
        this.addSteamDb("bundle");
    }

    BundlePageClass.prototype = Object.create(Super.prototype);
    BundlePageClass.prototype.constructor = SubPageClass;

    return BundlePageClass;
})();


let AppPageClass = (function(){

    let Super = StorePageClass;

    function AppPageClass(url) {
        Super.call(this);

        this.appid = GameId.getAppid(url);
        let metalinkNode = document.querySelector("#game_area_metalink a");
        this.metalink = metalinkNode && metalinkNode.getAttribute("href");

        this.data = this.storePageDataPromise();
        this.appName = document.querySelector(".apphub_AppName").textContent;

        // FIXME appPage.mediaSliderExpander();
        // FIXME appPage.initHdPlayer();
        this.addWishlistRemove();
        this.addCoupon();
        this.addPrices();
        this.addDlcInfo();

        this.addDrmWarnings();
        this.addMetacriticUserScore();
        this.addOpenCritic();
        this.displayPurchaseDate();

        this.addWidescreenCertification();

        this.addHltb();

        this.moveUsefulLinks();
        this.addLinks();
        this.addSteamDb("app");
        this.addHighlights();
        this.addFamilySharingWarning();

        this.addPackageInfoButton();
        this.addStats();

        this.addDlcCheckboxes();
        this.addBadgeProgress();
        this.addAstatsLink();
        this.addAchievementCompletionBar();

        this.showRegionalPricing("app");

        this.customizeAppPage();
        this.addReviewToggleButton();
        this.addHelpButton();

    }
    AppPageClass.prototype = Object.create(Super.prototype);
    AppPageClass.prototype.constructor = AppPageClass;

    AppPageClass.prototype.mediaSliderExpander = function() {
        let detailsBuild = false;
        let details  = document.querySelector("#game_highlights .rightcol, .workshop_item_header .col_right");

        if (details) {
            document.querySelector("#highlight_player_area").insertAdjacentHTML("beforeend", `
                <div class="es_slider_toggle btnv6_blue_hoverfade btn_medium">
                    <div data-slider-tooltip="` + Localization.str.expand_slider + `" class="es_slider_expand"><i class="es_slider_toggle_icon"></i></div>
                    <div data-slider-tooltip="` + Localization.str.contract_slider + `" class="es_slider_contract"><i class="es_slider_toggle_icon"></i></div>
                </div>
            `);
        }

        // Initiate tooltip
        ExtensionLayer.runInPageContext(function() { $J('[data-slider-tooltip]').v_tooltip({'tooltipClass': 'store_tooltip community_tooltip', 'dataName': 'sliderTooltip' }); });

        // FIXME media slider not finished
    };

    AppPageClass.prototype.initHdPlayer = function() {
        // FIXME
    };

    AppPageClass.prototype.storePageDataPromise = function() {
        let appid = this.appid;
        return new Promise(function(resolve, reject) {
            let cache = LocalData.get("storePageData_" + appid);

            if (cache && cache.data && !TimeHelper.isExpired(cache.updated, 3600)) {
                resolve(cache.data);
                return;
            }

            let apiparams = {
                appid: appid
            };
            if (this.metalink) {
                apiparams.mcurl = this.metalink;
            }
            if (SyncedStorage.get("showoc", true)) {
                apiparams.oc = 1;
            }

            Request.getApi("v01/storepagedata", apiparams)
                .then(function(response) {
                    if (response && response.result && response.result === "success") {
                        LocalData.set("storePageData_" + appid, {
                            data: response.data,
                            updated: Date.now(),
                        });
                        resolve(response.data);
                    } else {
                        reject();
                    }
                }, reject);
        });
    };

    /**
     *  Allows the user to intuitively remove an item from their wishlist on the app page
     */
    AppPageClass.prototype.addWishlistRemove = function() {
        if (!User.isSignedIn) { return; }
        let appid = this.appid;

        // there is no add to wishlist button and game is not purchased yet, add required nodes
        if (!document.querySelector("#add_to_wishlist_area") && !document.querySelector(".game_area_already_owned")) {
            let firstButton = document.querySelector(".queue_actions_ctn a.queue_btn_active");
            firstButton.insertAdjacentHTML("beforebegin", "<div id='add_to_wishlist_area_success' style='display: inline-block;'></div>");

            let wishlistArea = document.querySelector("#add_to_wishlist_area_success");
            DOMHelper.wrap(wishlistArea, firstButton);
            wishlistArea.insertAdjacentHTML("beforebegin", `<div id='add_to_wishlist_area' style='display: none;'><a class='btnv6_blue_hoverfade btn_medium' href='javascript:AddToWishlist(${appid}, \\"add_to_wishlist_area\\", \\"add_to_wishlist_area_success\\", \\"add_to_wishlist_area_fail\\", \\"1_5_9__407\\" );'><span>${Localization.str.add_to_wishlist}</span></a></div>`);
            wishlistArea.insertAdjacentHTML("beforebegin", `<div id='add_to_wishlist_area_fail' style='display: none;'></div>`);
        }

        let successNode = document.querySelector("#add_to_wishlist_area_success");
        if (!successNode) { return; }

        let imgNode = successNode.querySelector("img:last-child");
        if (!imgNode) { return; }

        imgNode.classList.add("es-in-wl");
        imgNode.insertAdjacentHTML("beforebegin", `<img class='es-remove-wl' src='${ExtensionLayer.getLocalUrl("img/remove.png")}' style='display:none' />`);
        imgNode.insertAdjacentHTML("beforebegin", `<img class='es-loading-wl' src='//steamcommunity-a.akamaihd.net/public/images/login/throbber.gif' style='display:none; width:16px' />`);

        successNode.addEventListener("click", function(e){
            e.preventDefault();

            let parent = successNode.parentNode;
            if (!parent.classList.contains("loading")) {
                parent.classList.add("loading");


                Request.post("//store.steampowered.com/api/removefromwishlist", {
                    sessionid: User.getSessionId(),
                    appid: appid
                }, {withCredentials: true}).then(response => {
                    document.querySelector("#add_to_wishlist_area").style.display = "inline";
                    document.querySelector("#add_to_wishlist_area_success").style.display = "none";

                    // Clear dynamicstore cache
                    /* // FIXME DynamicStore
                    chrome.storage.local.remove("dynamicstore");
                    */

                    // Invalidate dynamic store data cache
                    ExtensionLayer.runInPageContext("function(){ GDynamicStore.InvalidateCache(); }");
                }).finally(() => {
                    parent.classList.remove("loading");
                });
            }
        });

        /* // FIXME clear dynamic store
        $("#add_to_wishlist_area, #add_to_wishlist_area_success, .queue_btn_ignore").on("click", function(){
            // Clear dynamicstore cache
            chrome.storage.local.remove("dynamicstore");
        });
        */
    };

    AppPageClass.prototype.getFirstSubid = function() {
        let node = document.querySelector("div.game_area_purchase_game input[name=subid]");
        return node && node.value;
    };

    AppPageClass.prototype.addCoupon = function() {
        let inst = this;
        Inventory.promise().then(() => {

            console.log(inst.getFirstSubid());

            let coupon = Inventory.getCoupon(inst.getFirstSubid());
            if (!coupon) { return; }

            let couponDate = coupon.valid && coupon.valid.replace(/\[date](.+)\[\/date]/, function(m0, m1) { return new Date(m1 * 1000).toLocaleString(); });

            let purchaseArea = document.querySelector("#game_area_purchase");
            purchaseArea.insertAdjacentHTML("beforebegin", `
<div class="early_access_header">
    <div class="heading">
        <h1 class="inset">${Localization.str.coupon_available}</h1>
        <h2 class="inset">${Localization.str.coupon_application_note}</h2>
        <p>${Localization.str.coupon_learn_more}</p>
    </div>
    <div class="devnotes">
        <div style="display:flex;padding-top:10px">
            <img src="http://cdn.steamcommunity.com/economy/image/${coupon.image_url}" style="width:96px;height:64px;"/>
            <div style="display:flex;flex-direction:column;margin-left:10px">
                <h1>${coupon.title}</h1>
                <div>${coupon.discount_note || ""}</div>
                <div style="color:#a75124">${couponDate}</div>
            </div>
        </div>
    </div>
</div>`);

            // TODO show price in purchase box
        });
    };

    AppPageClass.prototype.addDlcInfo = function() {
        if (!this.isDlc()) { return; }

        Request.getApi("v01/dlcinfo", {appid: this.appid, appname: encodeURIComponent(this.appName)}).then(response => {
            console.log(response);
            let html = `<div class='block responsive_apppage_details_right heading'>${Localization.str.dlc_details}</div><div class='block'><div class='block_content'><div class='block_content_inner'><div class='details_block'>`;

            if (response && response.result === "success") {
                for(let i=0, len=response.data.length; i<len; i++) {

                    let item = response.data[i];
                    let iconUrl = Config.CdnHost + "/gamedata/icons/" + encodeURIComponent(item.icon);
                    let title = BrowserHelper.escapeHTML(item.desc);
                    let name = BrowserHelper.escapeHTML(item.name);
                    html += `<div class='game_area_details_specs'><div class='icon'><img src='${iconUrl}' align='top'></div><a class='name' title='${title}'>${name}</a></div>`;
                }
            }

            let suggestUrl = Config.PublicHost + "/gamedata/dlc_category_suggest.php?appid=" + this.appid + "&appname=" + encodeURIComponent(this.appName);
            html += `</div><a class='linkbar' style='margin-top: 10px;' href='${suggestUrl}' target='_blank'>${Localization.str.dlc_suggest}</a></div></div></div>`;

            document.querySelector("#category_block").parentNode.insertAdjacentHTML("beforebegin", html);
        });
    };

    AppPageClass.prototype.addMetacriticUserScore = function() {
        if (!SyncedStorage.get("showmcus", true)) { return; }

        let node = document.querySelector("#game_area_metascore");
        if (!node) { return; }

        this.data.then(response => {
            if (!response || !response.data || !response.data.userscore) { return; }

            let metauserscore = response.data.userscore * 10;
            if (!isNaN(metauserscore)) {
                node.insertAdjacentHTML("afterend", "<div id='game_area_userscore'></div>");

                let rating;
                if (metauserscore >= 75) {
                    rating = "high";
                } else if (metauserscore >= 50) {
                    rating = "medium";
                } else {
                    rating = "low";
                }
                document.querySelector("#game_area_userscore")
                    .insertAdjacentHTML("beforeend", `<div class='score ${rating}'>${metauserscore}</div>
                           <div class='logo'></div><div class='wordmark'><div class='metacritic'>${Localization.str.user_score}</div></div>`)
            }
        });
    };

    AppPageClass.prototype.addOpenCritic = function() {
        if (!SyncedStorage.get("showoc", true)) { return; }

        this.data.then(result => {
            if (!result || !result || !result.oc) { return; }
            let data = result.oc;

            if (!data.url) { return; }

            let node = document.querySelector(".rightcol .responsive_apppage_reviewblock");
            if (!node) {
                node = document.querySelector("#ReportAppBtn").parentNode;
            }
            node.parentNode.insertAdjacentHTML("afterend", "<div><div class='block responsive_apppage_reviewblock'><div id='game_area_opencritic' class='solo'></div><div style='clear: both'></div></div>");

            let opencriticImg = ExtensionLayer.getLocalUrl("img/opencritic.png");
            let award = data.award || "NA";

            document.querySelector("#game_area_opencritic")
                .insertAdjacentHTML("beforeend",
                    `<div class='score ${award.toLowerCase()}'>${data.score}</div>
                           <div><img src='${opencriticImg}'></div>
                           <div class='oc_text'>${award} - 
                               <a href='${data.url}?utm_source=enhanced-steam-itad&utm_medium=average' target='_blank'>${Localization.str.read_reviews}</a>
                           </div>`);

            // Add data to the review section in the left column, or create one if that block doesn't exist
            if (data.reviews.length > 0) {
                let reviewsNode = document.querySelector("#game_area_reviews");
                if (reviewsNode) {
                    reviewsNode.querySelector("p").insertAdjacentHTML("afterbegin", "<div id='es_opencritic_reviews'></div>");
                    reviewsNode.querySelector("p").insertAdjacentHTML("beforeend", `<div class='chart-footer'>${Localization.str.read_more_reviews} <a href='${data.url}?utm_source=enhanced-steam-itad&utm_medium=reviews' target='_blank'>OpenCritic.com</a></div>`);
                } else {
                    document.querySelector("#game_area_description")
                        .insertAdjacentHTML("beforebegin",
                            `<div id='game_area_reviews' class='game_area_description'>
                                    <h2>${Localization.str.reviews}</h2>
                                    <div id='es_opencritic_reviews'></div>
                                    <div class='chart-footer'>${Localization.str.read_more_reviews} <a href='${data.url}?utm_source=enhanced-steam-itad&utm_medium=reviews' target='_blank'>OpenCritic.com</a></div>
                                </div>`);

                    if (!SyncedStorage.get("show_apppage_reviews", true)) {
                        document.querySelector("#game_area_reviews").style.display = "none";
                    }
                }

                let review_text = "";
                for (let i=0, len=data.reviews.length; i<len; i++) {
                    let review = data.reviews[i];
                    let date = new Date(review.date);
                    review_text += `<p>"${review.snippet}"<br>${review.dScore} - <a href='${review.rURL}' target='_blank' data-tooltip-text='${review.author}, ${date.toLocaleDateString()}'>${review.name}</a></p>`;
                }

                document.querySelector("#es_opencritic_reviews").insertAdjacentHTML("beforeend", review_text);
                ExtensionLayer.runInPageContext("function() { BindTooltips( '#game_area_reviews', { tooltipCSSClass: 'store_tooltip'} ); }");
            }
        });
    };

    AppPageClass.prototype.displayPurchaseDate = function() {
        if (!SyncedStorage.get("purchase_dates", true)) { return; }

        let node = document.querySelector(".game_area_already_owned");
        if (!node) { return; }

        let appname = this.appName.replace(":", "").trim();

        User.getPurchaseDate(Language.getCurrentSteamLanguage(), appname).then(date => {
            if (!date) { return; }
            document.querySelector(".game_area_already_owned .already_in_library")
                .insertAdjacentHTML("beforeend", ` ${Localization.str.purchase_date.replace("__date__", date)}`);
        });
    };

    AppPageClass.prototype.addWidescreenCertification = function() {
        if (!SyncedStorage.get("showwsgf", true)) { return; }
        if (this.isDlc()) { return; }

        this.data.then(result => {
            if (!result || result.wsgf) { return; }
            let node = document.querySelector("game_details");

            let data = result.wsgf;
            if (!data) { return; }

            let path = data["Path"];
            let wsg = data["WideScreenGrade"];
            let mmg = data["MultiMonitorGrade"];
            let fkg = data["Grade4k"];
            let uws = data["UltraWideScreenGrade"];
            let wsg_icon = "", wsg_text = "", mmg_icon = "", mmg_text = "";
            let fkg_icon = "", fkg_text = "", uws_icon = "", uws_text = "";

            switch (wsg) {
                case "A":
                    wsg_icon = ExtensionLayer.getLocalUrl("img/wsgf/ws-gold.png");
                    wsg_text = Localization.str.wsgf.gold.replace(/__type__/g, "Widescreen");
                    break;
                case "B":
                    wsg_icon = ExtensionLayer.getLocalUrl("img/wsgf/ws-silver.png");
                    wsg_text = Localization.str.wsgf.silver.replace(/__type__/g, "Widescreen");
                    break;
                case "C":
                    wsg_icon = ExtensionLayer.getLocalUrl("img/wsgf/ws-limited.png");
                    wsg_text = Localization.str.wsgf.limited.replace(/__type__/g, "Widescreen");
                    break;
                case "Incomplete":
                    wsg_icon = ExtensionLayer.getLocalUrl("img/wsgf/ws-incomplete.png");
                    wsg_text = Localization.str.wsgf.incomplete;
                    break;
                case "Unsupported":
                    wsg_icon = ExtensionLayer.getLocalUrl("img/wsgf/ws-unsupported.png");
                    wsg_text = Localization.str.wsgf.unsupported.replace(/__type__/g, "Widescreen");
                    break;
            }

            switch (mmg) {
                case "A":
                    mmg_icon = ExtensionLayer.getLocalUrl("img/wsgf/mm-gold.png");
                    mmg_text = Localization.str.wsgf.gold.replace(/__type__/g, "Multi-Monitor");
                    break;
                case "B":
                    mmg_icon = ExtensionLayer.getLocalUrl("img/wsgf/mm-silver.png");
                    mmg_text = Localization.str.wsgf.silver.replace(/__type__/g, "Multi-Monitor");
                    break;
                case "C":
                    mmg_icon = ExtensionLayer.getLocalUrl("img/wsgf/mm-limited.png");
                    mmg_text = Localization.str.wsgf.limited.replace(/__type__/g, "Multi-Monitor");
                    break;
                case "Incomplete":
                    mmg_icon = ExtensionLayer.getLocalUrl("img/wsgf/mm-incomplete.png");
                    mmg_text = Localization.str.wsgf.incomplete;
                    break;
                case "Unsupported":
                    mmg_icon = ExtensionLayer.getLocalUrl("img/wsgf/mm-unsupported.png");
                    mmg_text = Localization.str.wsgf.unsupported.replace(/__type__/g, "Multi-Monitor");
                    break;
            }

            switch (uws) {
                case "A":
                    uws_icon = ExtensionLayer.getLocalUrl("img/wsgf/uw-gold.png");
                    uws_text = Localization.str.wsgf.gold.replace(/__type__/g, "Ultra-Widescreen");
                    break;
                case "B":
                    uws_icon = ExtensionLayer.getLocalUrl("img/wsgf/uw-silver.png");
                    uws_text = Localization.str.wsgf.silver.replace(/__type__/g, "Ultra-Widescreen");
                    break;
                case "C":
                    uws_icon = ExtensionLayer.getLocalUrl("img/wsgf/uw-limited.png");
                    uws_text = Localization.str.wsgf.limited.replace(/__type__/g, "Ultra-Widescreen");
                    break;
                case "Incomplete":
                    uws_icon = ExtensionLayer.getLocalUrl("img/wsgf/uw-incomplete.png");
                    uws_text = Localization.str.wsgf.incomplete;
                    break;
                case "Unsupported":
                    uws_icon = ExtensionLayer.getLocalUrl("img/wsgf/uw-unsupported.png");
                    uws_text = Localization.str.wsgf.unsupported.replace(/__type__/g, "Ultra-Widescreen");
                    break;
            }

            switch (fkg) {
                case "A":
                    fkg_icon = ExtensionLayer.getLocalUrl("img/wsgf/4k-gold.png");
                    fkg_text = Localization.str.wsgf.gold.replace(/__type__/g, "4k UHD");
                    break;
                case "B":
                    fkg_icon = ExtensionLayer.getLocalUrl("img/wsgf/4k-silver.png");
                    fkg_text = Localization.str.wsgf.silver.replace(/__type__/g, "4k UHD");
                    break;
                case "C":
                    fkg_icon = ExtensionLayer.getLocalUrl("img/wsgf/4k-limited.png");
                    fkg_text = Localization.str.wsgf.limited.replace(/__type__/g, "4k UHD");
                    break;
                case "Incomplete":
                    fkg_icon = ExtensionLayer.getLocalUrl("img/wsgf/4k-incomplete.png");
                    fkg_text = Localization.str.wsgf.incomplete;
                    break;
                case "Unsupported":
                    fkg_icon = ExtensionLayer.getLocalUrl("img/wsgf/4k-unsupported.png");
                    fkg_text = Localization.str.wsgf.unsupported.replace(/__type__/g, "4k UHD");
                    break;
            }


            let wsgfUrl = BrowserHelper.escapeHTML(path);

            let html = "<div class='block responsive_apppage_details_right heading'>"+Localization.str.wsgf.certifications+"</div><div class='block underlined_links'><div class='block_content'><div class='block_content_inner'><div class='details_block'><center>";
            if (wsg !== "Incomplete") { html += "<a target='_blank' href='" + wsgfUrl + "'><img src='" + BrowserHelper.escapeHTML(wsg_icon) + "' height='120' title='" + BrowserHelper.escapeHTML(wsg_text) + "' border=0></a>&nbsp;&nbsp;&nbsp;"; }
            if (mmg !== "Incomplete") { html += "<a target='_blank' href='" + wsgfUrl + "'><img src='" + BrowserHelper.escapeHTML(mmg_icon) + "' height='120' title='" + BrowserHelper.escapeHTML(mmg_text) + "' border=0></a>&nbsp;&nbsp;&nbsp;"; }
            if (uws !== "Incomplete") { html += "<a target='_blank' href='" + wsgfUrl + "'><img src='" + BrowserHelper.escapeHTML(uws_icon) + "' height='120' title='" + BrowserHelper.escapeHTML(uws_text) + "' border=0></a>&nbsp;&nbsp;&nbsp;"; }
            if (fkg !== "Incomplete") { html += "<a target='_blank' href='" + wsgfUrl + "'><img src='" + BrowserHelper.escapeHTML(fkg_icon) + "' height='120' title='" + BrowserHelper.escapeHTML(fkg_text) + "' border=0></a>&nbsp;&nbsp;&nbsp;"; }
            if (path) { html += "</center><br><a class='linkbar' target='_blank' href='" + wsgfUrl + "'>" + Localization.str.rating_details + " <img src='//store.steampowered.com/public/images/v5/ico_external_link.gif' border='0' align='bottom'></a>"; }
            html += "</div></div></div></div>";

            node.insertAdjacentHTML("afterend", html);
        });
    };

    AppPageClass.prototype.addHltb = function() {
        if (!SyncedStorage.get("showhltb", true)) { return; }
        if (this.isDlc()) { return; }

        this.data.then(result => {
            if (!result || !result.hltb) { return; }
            let data = result.hltb;

            let html = "";
            if (data.success) {
                html = `<div class='block responsive_apppage_details_right heading'>${Localization.str.hltb.title}</div>
                            <div class='block game_details underlined_links'>
                            <div class='block_content'><div class='block_content_inner'><div class='details_block'>`;

                if (data["main_story"]){
                    let value = BrowserHelper.escapeHTML(data['main_story']);
                    html += `<b>${Localization.str.hltb.main}:</b><span style='float: right;'>${value}</span><br>`;
                }
                if (data["main_extras"]){
                    let value = BrowserHelper.escapeHTML(data['main_extras']);
                    html += `<b>${Localization.str.hltb.main_e}:</b><span style='float: right;'>${value}</span><br>`;
                }
                if (data["comp"]) {
                    let value = BrowserHelper.escapeHTML(data['comp']);
                    html += `<b>${Localization.str.hltb.compl}:</b><span style='float: right;'>${value}</span><br>`;
                }

                let suggestUrl = Config.PublicHost + "/gamedata/hltb_link_suggest.php";

                html += "</div>"
                    + "<a class='linkbar' href='" + BrowserHelper.escapeHTML(data['url']) + "' target='_blank'>" + Localization.str.more_information + " <img src='//store.steampowered.com/public/images/v5/ico_external_link.gif' border='0' align='bottom'></a>"
                    + "<a class='linkbar' href='" + BrowserHelper.escapeHTML(data['submit_url']) + "' target='_blank'>" + Localization.str.hltb.submit + " <img src='//store.steampowered.com/public/images/v5/ico_external_link.gif' border='0' align='bottom'></a>"
                    + "<a class='linkbar' href='" + suggestUrl + "' id='suggest'>" + Localization.str.hltb.wrong + " - " + Localization.str.hltb.help + " <img src='//store.steampowered.com/public/images/v5/ico_external_link.gif' border='0' align='bottom'></a>"
                    + "</div></div></div>";


            } else {
                html = "<div class='block game_details underlined_links'>"
                    + "<div class='block_header'><h4>How Long to Beat</h4></div>"
                    + "<div class='block_content'><div class='block_content_inner'><div class='details_block'>" + Localization.str.hltb.no_data + "</div>"
                    + "<a class='linkbar' href='//www.enhancedsteam.com/gamedata/hltb_link_suggest.php' id='suggest'>" + Localization.str.hltb.help + " <img src='//store.steampowered.com/public/images/v5/ico_external_link.gif' border='0' align='bottom'></a>"
                    + "</div></div></div>";
            }

            document.querySelector("div.game_details").insertAdjacentHTML("afterend", html);

            document.querySelector("#suggest").addEventListener("click", function(){
                LocalData.del("storePageData_" + this.appid);
            });
        });
    };

    AppPageClass.prototype.moveUsefulLinks = function() {
        if (!this.isAppPage()) { return; }

        let usefulLinks = document.querySelector("#ReportAppBtn").parentNode.parentNode;
        usefulLinks.classList.add("es_useful_link");

        let sideDetails = document.querySelector(".es_side_details_wrap");
        if (sideDetails) {
            sideDetails.insertAdjacentElement("afterend", usefulLinks);
        } else {
            document.querySelector("div.rightcol.game_meta_data").insertAdjacentElement("afterbegin", usefulLinks);
        }
    };

    AppPageClass.prototype.addLinks = function() {
        let linkNode = document.querySelector("#ReportAppBtn").parentNode;

        if (SyncedStorage.get("showclient", true)) {
            let cls = "steam_client_btn";
            let url = "steam://url/StoreAppPage/" + this.appid;
            let str = Localization.str.viewinclient;

            linkNode.insertAdjacentHTML("afterbegin",
                `<a class="btnv6_blue_hoverfade btn_medium ${cls}" target="_blank" href="${url}" style="display: block; margin-bottom: 6px;">
                    <span><i class="ico16"></i>&nbsp;&nbsp; ${str}</span></a>`);
        }

        if (SyncedStorage.get("showpcgw", true)) {
            let cls = "pcgw_btn";
            let url = "http://pcgamingwiki.com/api/appid.php?appid=" + this.appid;
            let str = Localization.str.wiki_article.replace("__pcgw__","PCGamingWiki");

            linkNode.insertAdjacentHTML("afterbegin",
                `<a class="btnv6_blue_hoverfade btn_medium ${cls}" target="_blank" href="${url}" style="display: block; margin-bottom: 6px;">
                    <span><i class="ico16"></i>&nbsp;&nbsp; ${str}</span></a>`);
        }

        if (SyncedStorage.get("showsteamcardexchange", true)) {
            if (document.querySelector(".icon img[src$='/ico_cards.png'")) { // has trading cards
                let cls = "cardexchange_btn";
                let url = "http://www.steamcardexchange.net/index.php?gamepage-appid-" + this.appid;
                let str = Localization.str.view_in + ' Steam Card Exchange';

                linkNode.insertAdjacentHTML("afterbegin",
                    `<a class="btnv6_blue_hoverfade btn_medium ${cls}" target="_blank" href="${url}" style="display: block; margin-bottom: 6px;">
                    <span><i class="ico16"></i>&nbsp;&nbsp; ${str}</span></a>`);
            }
        }
    };

    AppPageClass.prototype.addHighlights = function() {
        if (!SyncedStorage.get("highlight_owned", true)) { return; }

        if (document.querySelector(".game_area_already_owned .ds_owned_flag")) {
            document.querySelector(".apphub_AppName").style.color = SyncedStorage.get("highlight_owned_color", "inherit");
        }
    };

    AppPageClass.prototype.addFamilySharingWarning = function() {
        if (!SyncedStorage.get("exfgls", true)) { return; }

        this.data.then(result => {
            if (!result.exfgls || !result.exfgls.excluded) { return; }

            let str = Localization.str.family_sharing_notice;
            document.querySelector("#game_area_purchase").insertAdjacentHTML("beforebegin",
                `<div id="purchase_note"><div class="notice_box_top"></div><div class="notice_box_content">${str}</div><div class="notice_box_bottom"></div></div>`);
        });
    };

    AppPageClass.prototype.addPackageInfoButton = function() {
        if (false && !SyncedStorage.get("show_package_info", false)) { return; } // FIXME

        let nodes = document.querySelectorAll(".game_area_purchase_game_wrapper");
        for (let i=0, len=nodes.length; i<len; i++) {
            let node = nodes[i];
            if (node.querySelector(".btn_packageinfo")) { continue; }

            let subid = node.querySelector("input[name=subid]").value;
            if (!subid) { continue; }

            node.querySelector(".game_purchase_action").insertAdjacentHTML("afterbegin",
                `<div class="game_purchase_action_bg"><div class="btn_addtocart btn_packageinfo">
                 <a class="btnv6_blue_blue_innerfade btn_medium" href="//store.steampowered.com/sub/${subid}/"><span>
                 ${Localization.str.package_info}</span></a></div></div>`);
        }
    };

    function addSteamChart(result) {
        if (this.isDlc()) { return; }
        if (!SyncedStorage.get("show_steamchart_info", true) || !result.charts || !result.charts.chart) { return; }

        let appid = this.appid;
        let chart = result.charts.chart;
        let html = '<div id="steam-charts" class="game_area_description"><h2>' + Localization.str.charts.current + '</h2>';
            html += '<div class="chart-content">';
                html += '<div class="chart-stat"><span class="num">' + BrowserHelper.escapeHTML(chart["current"]) + '</span><br>' + Localization.str.charts.playing_now + '</div>';
                html += '<div class="chart-stat"><span class="num">' + BrowserHelper.escapeHTML(chart["peaktoday"]) + '</span><br>' + Localization.str.charts.peaktoday + '</div>';
                html += '<div class="chart-stat"><span class="num">' + BrowserHelper.escapeHTML(chart["peakall"]) + '</span><br>' + Localization.str.charts.peakall + '</div>';
            html += '</div>';
            html += '<span class="chart-footer">Powered by <a href="http://steamcharts.com/app/' + appid + '" target="_blank">SteamCharts.com</a></span>';
            html += '</div>';

        document.querySelector(".sys_req").parentNode.insertAdjacentHTML("beforebegin", html);
    }

    function addSteamSpy(result) {
        if (this.isDlc()) { return; }
        if (!SyncedStorage.get("show_steamspy_info", true)) { return; } // customization setting
        if (!SyncedStorage.get("steamspy", true) || !result.steamspy || !result.steamspy.owners) { return; }

        function getTimeString(value) {

            let days = Math.trunc(value / 1440);
            value -= days * 1440;

            let hours = Math.trunc(value / 60);
            value -= hours * 60;

            let minutes = value;

            let result = "";
            if (days > 0) { result += days+"d ";}
            result += hours+"h "+minutes+"m";

            return result;
        }

        let appid = this.appid;

        let owners = result.steamspy.owners.split("..")
        let owners_from = BrowserHelper.escapeHTML(owners[0].trim());
        let owners_to = BrowserHelper.escapeHTML(owners[1].trim());
        let averageTotal = getTimeString(result.steamspy.average_forever);
        let average2weeks = getTimeString(result.steamspy.average_2weeks);

        let html = '<div id="steam-spy" class="game_area_description"><h2>' + Localization.str.spy.player_data + '</h2>';
            html += '<div class="chart-content">';
                html += '<div class="chart-stat"><span class="num">' + owners_from + "<br>" + owners_to + '</span><br>' + Localization.str.spy.owners + '</div>';
                html += '<div class="chart-stat"><span class="num">' + averageTotal + '</span><br>' + Localization.str.spy.average_playtime + '</div>';
                html += '<div class="chart-stat"><span class="num">' + average2weeks + '</span><br>' + Localization.str.spy.average_playtime_2weeks + '</div>';
            html += "</div>";
            html += "<span class='chart-footer' style='padding-right: 13px;'>Powered by <a href='http://steamspy.com/app/" + appid + "' target='_blank'>steamspy.com</a></span>";
            html += "</div>";

        document.querySelector(".sys_req").parentNode.insertAdjacentHTML("beforebegin", html);
    }

    function addSurveyData(result) {
        if (this.isDlc()) { return; }
        if (this.isVideo()) { return; }
        if (!SyncedStorage.get("show_apppage_surveys", true) || !result.survey) { return; }

        let survey = result.survey;
        let appid = this.appid;

        let html = "<div id='performance_survey' class='game_area_description'><h2>" + Localization.str.survey.performance_survey + "</h2>";

        if (survey.success) {
            html += "<p>" + Localization.str.survey.users.replace("__users__", survey["responses"]) + ".</p>";
            html += "<p><b>" + Localization.str.survey.framerate + "</b>: " + Math.round(survey["frp"]) + "% " + Localization.str.survey.framerate_response + " "
            switch (survey["fr"]) {
                case "30": html += "<span style='color: #8f0e10;'>" + Localization.str.survey.framerate_30 + "</span>"; break;
                case "fi": html += "<span style='color: #e1c48a;'>" + Localization.str.survey.framerate_fi + "</span>"; break;
                case "va": html += "<span style='color: #8BC53F;'>" + Localization.str.survey.framerate_va + "</span>"; break;
            }

            html += "<br><b>" + Localization.str.survey.resolution + "</b>: " + Localization.str.survey.resolution_support + " "
            switch (survey["mr"]) {
                case "less": html += "<span style='color: #8f0e10;'>" + Localization.str.survey.resolution_less.replace("__pixels__", "1920x1080") + "</span>"; break;
                case "hd": html += "<span style='color: #8BC53F;'>" + Localization.str.survey.resolution_up.replace("__pixels__", "1920x1080 (HD)") + "</span>"; break;
                case "wqhd": html += "<span style='color: #8BC53F;'>" + Localization.str.survey.resolution_up.replace("__pixels__", "2560x1440 (WQHD)") + "</span>"; break;
                case "4k": html += "<span style='color: #8BC53F;'>" + Localization.str.survey.resolution_up.replace("__pixels__", "3840x2160 (4K)") + "</span>"; break;
            }

            html += "<br><b>" + Localization.str.survey.graphics_settings + "</b>: ";
            if (survey["gs"]) {
                html += "<span style='color: #8BC53F;'>" + Localization.str.survey.gs_y + "</span></p>";
            } else {
                html += "<span style='color: #8f0e10;'>" + Localization.str.survey.gs_n + "</span></p>";
            }

            if (survey["nvidia"] !== undefined || survey["amd"] !== undefined || survey["intel"] !== undefined || survey["other"] !== undefined) {
                html += "<p><b>" + Localization.str.survey.satisfaction + "</b>:";
                html += "<div class='performance-graph'>";
                if (survey["nvidia"] !== undefined) {
                    if (survey["nvidia"] > 90 || survey["nvidia"] < 10) {
                        html += "<div class='row'><div class='left-bar nvidia' style='width: " + parseInt(survey["nvidia"]).toString() + "%;'><span>Nvidia&nbsp;" + survey["nvidia"] + "%</span></div><div class='right-bar' style='width: " + parseInt(100-survey["nvidia"]) + "%;'></div></div>";
                    } else {
                        html += "<div class='row'><div class='left-bar nvidia' style='width: " + parseInt(survey["nvidia"]).toString() + "%;'><span>Nvidia</span></div><div class='right-bar' style='width: " + parseInt(100-survey["nvidia"]) + "%;'><span>" + survey["nvidia"] + "%</span></div></div>";
                    }
                }
                if (survey["amd"] !== undefined) {
                    if (survey["amd"] > 90 || survey["amd"] < 10) {
                        html += "<div class='row'><div class='left-bar amd' style='width: " + parseInt(survey["amd"]).toString() + "%;'><span>AMD&nbsp;" + survey["amd"] + "%</span></div><div class='right-bar' style='width: " + parseInt(100-survey["amd"]) + "%'></div></div>";
                    } else {
                        html += "<div class='row'><div class='left-bar amd' style='width: " + parseInt(survey["amd"]).toString() + "%;'><span>AMD</span></div><div class='right-bar' style='width: " + parseInt(100-survey["amd"]) + "%'><span>" + survey["amd"] + "%</span></div></div>";
                    }
                }
                if (survey["intel"] !== undefined) {
                    if (survey["intel"] > 90 || survey["intel"] < 10) {
                        html += "<div class='row'><div class='left-bar intel' style='width: " + parseInt(survey["intel"]).toString() + "%;'><span>Intel&nbsp;" + survey["intel"] + "%</span></div><div class='right-bar' style='width: " + parseInt(100-survey["intel"]) + "%'></div></div>";
                    } else {
                        html += "<div class='row'><div class='left-bar intel' style='width: " + parseInt(survey["intel"]).toString() + "%;'><span>Intel</span></div><div class='right-bar' style='width: " + parseInt(100-survey["intel"]) + "%'><span>" + survey["intel"] + "%</span></div></div>";
                    }
                }
                if (survey["other"] !== undefined) {
                    if (survey["other"] > 90 || survey["other"] < 10) {
                        html += "<div class='row'><div class='left-bar other' style='width: " + parseInt(survey["other"]).toString() + "%;'><span>Other&nbsp;" + survey["other"] + "%</span></div><div class='right-bar' style='width: " + parseInt(100-survey["other"]) + "%'></div></div>";
                    } else {
                        html += "<div class='row'><div class='left-bar other' style='width: " + parseInt(survey["other"]).toString() + "%;'><span>Other</span></div><div class='right-bar' style='width: " + parseInt(100-survey["other"]) + "%'><span>" + survey["other"] + "%</span></div></div>";
                    }
                }
                html += "</div>";
            }
        } else {
            html += "<p>" + Localization.str.survey.nobody + ".</p>";
        }

        if (document.querySelector(".game_area_already_owned") && document.querySelector(".hours_played")) {
            html += "<a class='btnv6_blue_blue_innerfade btn_medium es_btn_systemreqs' href='//enhancedsteam.com/survey/?appid=" + appid + "'><span>" + Localization.str.survey.take + "</span></a>";
        }

        html += "</div>";

        document.querySelector(".sys_req").parentNode.insertAdjacentHTML("beforebegin", html);
    }

    AppPageClass.prototype.addStats = function(){
        if (this.isDlc()) { return; }
        this.data.then(result => {

            addSteamChart.call(this, result);
            addSteamSpy.call(this, result);
            addSurveyData.call(this, result);

        });
    };

    AppPageClass.prototype.addDlcCheckboxes = function() {
        let nodes = document.querySelectorAll(".game_area_dlc_row");
        if (nodes.length == 0) { return; }
        let expandedNode = document.querySelector("#game_area_dlc_expanded");

        if (expandedNode) {
            expandedNode
                .insertAdjacentHTML("afterend", "<div class='game_purchase_action game_purchase_action_bg' style='float: left; margin-top: 4px; margin-bottom: 10px; display: none;' id='es_selected_btn'><div class='btn_addtocart'><a class='btnv6_green_white_innerfade btn_medium'><span>" + Localization.str.add_selected_dlc_to_cart + "</span></a></div></div>");

            document.querySelector(".game_area_dlc_section")
                .insertAdjacentElement("<div style='clear: both;'></div>");
        } else {
            document.querySelector(".gameDlcBlocks")
                .insertAdjacentHTML("afterend", "<div class='game_purchase_action game_purchase_action_bg' style='float: left; margin-top: 4px; display: none;' id='es_selected_btn'><div class='btn_addtocart'><a class='btnv6_green_white_innerfade btn_medium'><span>" + Localization.str.add_selected_dlc_to_cart + "</span></a></div></div>");
        }

        let form = document.createElement("form");
        form.setAttribute("name", "add_selected_dlc_to_cart");
        form.setAttribute("action", "/cart/");
        form.setAttribute("method", "POST");
        form.setAttribute("id", "es_selected_cart");

        let button = document.querySelector("#es_selected_btn");
        button.insertAdjacentElement("beforebegin", form);
        button.addEventListener("click", function(){
            document.querySelector("form[name=add_selected_dlc_to_cart]").submit();
        });

        for (let i=0, len=nodes.length; i<len; i++) {
            let node = nodes[i];

            if (node.querySelector("input")) {
                let value = node.querySelector("input").value;

                node.querySelector(".game_area_dlc_name")
                    .insertAdjacentHTML("afterbegin", "<input type='checkbox' class='es_dlc_selection' style='cursor: default;' id='es_select_dlc_" + value + "' value='" + value + "'><label for='es_select_dlc_" + value + "' style='background-image: url( " + ExtensionLayer.getLocalUrl("img/check_sheet.png") + ");'></label>");
            } else {
                node.querySelector(".game_area_dlc_name").style.marginLeft = "23px";
            }
        }

        document.querySelector(".game_area_dlc_section .gradientbg")
            .insertAdjacentHTML("afterend", "<div style='height: 28px; padding-left: 15px; display: none;' id='es_dlc_option_panel'></div>");

        document.querySelector("#es_dlc_option_panel")
            .insertAdjacentHTML("afterbegin", `
                <div class='es_dlc_option' id='unowned_dlc_check'>${Localization.str.select.unowned_dlc}</div>
                <div class='es_dlc_option' id='wl_dlc_check'>${Localization.str.select.wishlisted_dlc}</div>
                <div class='es_dlc_option' id='no_dlc_check'>${Localization.str.select.none}</div>
            `);

        document.querySelector("#unowned_dlc_check").addEventListener("click", function () {
            let nodes = document.querySelectorAll(".game_area_dlc_section .game_area_dlc_row:not(.ds_owned) input:not(:checked)");
            for (let i=0, len=nodes.length; i<len; i++) {
                nodes[i].checked = true;
            }
        });

        document.querySelector("#wl_dlc_check").addEventListener("click", function(){
            let nodes = document.querySelectorAll(".game_area_dlc_section .ds_wishlist input:not(:checked)");
            for (let i=0, len=nodes.length; i<len; i++) {
                nodes[i].checked = true;
            }
        });

        document.querySelector("#no_dlc_check").addEventListener("click", function(){
            let nodes = document.querySelectorAll(".game_area_dlc_section .game_area_dlc_row input:checked");
            for (let i=0, len=nodes.length; i<len; i++) {
                nodes[i].checked = false;
            }
        });

        document.querySelector(".game_area_dlc_section .gradientbg")
            .insertAdjacentHTML("beforeend", "<a id='es_dlc_option_button'>" + Localization.str.thewordoptions + " ▾</a>");

        document.querySelector("#es_dlc_option_button").addEventListener("click", function() {
            document.querySelector("#es_dlc_option_panel")
                .classList.toggle("esi-shown");

            let button = document.querySelector("#es_dlc_option_button");

            button.textContent = (button.textContent.match("▾")
                ? Localization.str.thewordoptions + " ▴"
                : Localization.str.thewordoptions + " ▾");
        });

        document.querySelector(".game_area_dlc_section").addEventListener("change", function(e){
            if (!e.target.classList.contains("es_dlc_selection")) { return; }

            let cartNode = document.querySelector("#es_selected_cart");
            cartNode.innerHTML = "<input type=\"hidden\" name=\"action\" value=\"add_to_cart\"><input type=\"hidden\" name=\"sessionid\" value=\"" + User.getSessionId() + "\">"

            let nodes = document.querySelectorAll(".es_dlc_selection:checked");
            for (let i=0, len=nodes.length; i<len; i++) {
                let node = nodes[i];

                let input = document.createElement("input");
                input.setAttribute("type", "hidden");
                input.setAttribute("name", "subid[]");
                input.setAttribute("value", node.value);

                cartNode.insertAdjacentElement("beforeend", input);
            }

            let button = document.querySelector("#es_selected_btn");
            button.style.display = (nodes.length > 0 ? "block" : "none");
        })
    };

    AppPageClass.prototype.addBadgeProgress = function(){
        if (!User.isSignedIn) { return; }
        if (!SyncedStorage.get("show_badge_progress", true)) { return; }
        if (!this.hasCards()) { return; }

        let appid = this.appid;

        document.querySelector("head")
            .insertAdjacentHTML("beforeend", '<link rel="stylesheet" type="text/css" href="//steamcommunity-a.akamaihd.net/public/css/skin_1/badges.css">');

        document.querySelector("#category_block").insertAdjacentHTML("afterend", `
					<div class="block responsive_apppage_details_right heading">
						${Localization.str.badge_progress}
					</div>
					<div class="block">
						<div class="block_content_inner es_badges_progress_block" style="display:none;">
							<div class="es_normal_badge_progress es_progress_block" style="display:none;"></div>
							<div class="es_foil_badge_progress es_progress_block" style="display:none;"></div>
						</div>
					</div>
				`);

        Request.getHttp("//steamcommunity.com/my/gamecards/" + this.appid).then(result => {
            loadBadgeContent(".es_normal_badge_progress", result, ".badge_current");
        });

        Request.getHttp("//steamcommunity.com/my/gamecards/" + this.appid + "?border=1").then(result => {
            loadBadgeContent(".es_foil_badge_progress", result, ".badge_current");
        });

        function loadBadgeContent(targetSelector, result, selector) {
            let dummy = document.createElement("html");
            dummy.innerHTML = result;
            let badge = dummy.querySelector(selector);
            if (badge) {
                displayBadgeInfo(targetSelector, badge);
            }
        }

        function displayBadgeInfo(targetSelector, badgeNode) {
            let blockSel = document.querySelector(targetSelector);
            blockSel.append(badgeNode);

            if (!badgeNode.querySelector(".friendPlayerLevelNum")) {
                let progress;
                let card_num_owned = badgeNode.querySelectorAll(".badge_detail_tasks .owned").length;
                let card_num_total = badgeNode.querySelectorAll(".badge_detail_tasks .badge_card_set_card").length;
                let progress_text_length = (progress = badgeNode.querySelector(".gamecard_badge_progress")) ? progress.textContent.trim().length : 0;
                let next_level_empty_badge = badgeNode.querySelectorAll(".gamecard_badge_progress .badge_info").length;
                let badge_completed = (progress_text_length > 0 && next_level_empty_badge == 0);
                let show_card_num = (card_num_owned > 0 && progress_text_length === 0) || (card_num_owned > 0 && !badge_completed);
                let is_normal_badge = targetSelector === ".es_normal_badge_progress";

                if (is_normal_badge || (card_num_owned > 0 || !blockSel.querySelector(".badge_empty_circle"))) {
                    document.querySelector(".es_badges_progress_block").style.display='block';
                    blockSel.style.display = "block";

                    let progressBold = badgeNode.querySelector(".progress_info_bold");

                    blockSel.insertAdjacentHTML("beforeend", `
								<div class="es_cards_numbers">
									<div class="es_cards_remaining">${progressBold ? progressBold.textContent : ""}</div>
								</div>
								<div class="game_area_details_specs">
									<div class="icon"><img src="//store.steampowered.com/public/images/v6/ico/ico_cards.png" width="24" height="16" border="0" align="top"></div>
									<a href="//steamcommunity.com/my/gamecards/${ appid + (is_normal_badge ? `/` : `?border=1`) }" class="name">${badge_completed ? Localization.str.view_badge : Localization.str.view_badge_progress}</a>
								</div>
							`);

                    if (show_card_num) {
                        blockSel.querySelector(".es_cards_numbers")
                            .insertAdjacentHTML("beforeend", `
									<div class="es_cards_owned">${Localization.str.cards_owned.replace("__owned__", card_num_owned).replace("__possible__", card_num_total)}</div>
								`);
                    }

                    let last = blockSel.querySelector(".badge_empty_right div:last-child");
                    last.classList.add("badge_empty_name");
                    last.style = "";
                    last.textContent = Localization.str.badge_not_unlocked;
                }
            } else {
                blockSel.remove();
            }
        }
    };


    AppPageClass.prototype.addAstatsLink = function(){
        if (!SyncedStorage.get("showastatslink", true)) { return; }
        if (!this.hasAchievements()) { return; }

        let imgUrl = ExtensionLayer.getLocalUrl("img/ico/astatsnl.png");
        let url = "http://astats.astats.nl/astats/Steam_Game_Info.php?AppID=" + this.appid;

        document.querySelector("#achievement_block").insertAdjacentHTML("beforeend",
            `<div class='game_area_details_specs'>
                      <div class='icon'><img src='${imgUrl}' style='margin-left: 4px; width: 16px;'></div>
                      <a class='name' href='${url}' target='_blank'><span>${Localization.str.view_astats}</span></a>`
            );
    };

    AppPageClass.prototype.addAchievementCompletionBar = function(){
        if (!SyncedStorage.get("showachinstore", true)) { return; }
        if (!this.hasAchievements()) { return; }

        document.querySelector(".myactivity_block .details_block").insertAdjacentHTML("afterend",
            "<link href='//steamcommunity-a.akamaihd.net/public/css/skin_1/playerstats_generic.css' rel='stylesheet' type='text/css'><div id='es_ach_stats' style='margin-bottom: 9px; margin-top: -16px; float: right;'></div>");

        Request.getHttp("//steamcommunity.com/my/stats/" + this.appid + "/").then(response => {
            let dummy = document.createElement("html");
            dummy.innerHTML = response;

            let node = document.querySelector("#es_ach_stats");
            node.append(dummy.querySelector("#topSummaryAchievements"));

            if (!node.innerHTML.match(/achieveBarFull\.gif/)) { return; }

            let barFull = node.innerHTML.match(/achieveBarFull\.gif" width="([0-9]|[1-9][0-9]|[1-9][0-9][0-9])"/)[1];
            let barEmpty = node.innerHTML.match(/achieveBarFull\.gif" width="([0-9]|[1-9][0-9]|[1-9][0-9][0-9])"/)[1];
            barFull = barFull * .88;
            barEmpty = barEmpty * .88;

            console.log(node.innerHTML);

            node.innerHTML = node.innerHTML.replace(/achieveBarFull\.gif" width="([0-9]|[1-9][0-9]|[1-9][0-9][0-9])"/, "achieveBarFull.gif\" width=\"" + BrowserHelper.escapeHTML(barFull.toString()) + "\"");
            node.innerHTML = node.innerHTML.replace(/achieveBarEmpty\.gif" width="([0-9]|[1-9][0-9]|[1-9][0-9][0-9])"/, "achieveBarEmpty.gif\" width=\"" + BrowserHelper.escapeHTML(barEmpty.toString()) + "\"");
            node.innerHTML = node.innerHTML.replace("::", ":");
        });
    };

    AppPageClass.prototype.customizeAppPage = function(){
        let instance = this;

        let nodes = document.querySelectorAll(".purchase_area_spacer");
        nodes[nodes.length-1].insertAdjacentHTML("beforeend",
            `<link rel='stylesheet' type='text/css' href='//steamstore-a.akamaihd.net/public/css/v6/home.css'>
            <style type='text/css'>body.v6 h2 { letter-spacing: normal; text-transform: none; }</style>
            <div id="es_customize_btn" class="home_actions_ctn" style="margin: 0px;">
                <div class="home_btn home_customize_btn" style="z-index: 13;">${ Localization.str.customize }</div>
                <div class='home_viewsettings_popup'>
                    <div class='home_viewsettings_instructions' style='font-size: 12px;'>${ Localization.str.apppage_sections }</div>
                </div>
            </div>
            <div style="clear: both;"></div>`);

        document.querySelector("#es_customize_btn").addEventListener("click", function(e) {
            e.target.classList.toggle("active");
        });

        document.querySelector("body").addEventListener("click", function(e){
            if (e.target.closest("#es_customize_btn")) { return; }
            let node = document.querySelector("#es_customize_btn .home_customize_btn.active");
            if (!node) { return; }
            node.classList.remove("active");
        });

        function firstText(node) {
            for (node=node.firstChild;node;node=node.nextSibling){
                if (node.nodeType === 3) { return node.textContent; }
            }
            return "";
        }

        function addToggleHandler(name, elSelector, text, forceShow, callback) {
            let element = document.querySelector(elSelector);
            if (!element && !forceShow) { return; }

            let state = SyncedStorage.get(name, true);
            text = (typeof text === "string" && text) || firstText(element.querySelector("h2")).toLowerCase();

            document.querySelector("body").classList.toggle(name.replace("show_", "es_") + "_hidden", !SyncedStorage.get(name, true));

            if (element) {
                element.classList.toggle("es_hide", !SyncedStorage.get(name, true));

                if (element.classList.contains("es_hide")) {
                    element.style.display = "none"; // TODO slideUp
                }
            }

            document.querySelector("#es_customize_btn .home_viewsettings_popup").insertAdjacentHTML("beforeend",
                `<div class="home_viewsettings_checkboxrow ellipsis" id="${name}">
                    <div class="home_viewsettings_checkbox ${SyncedStorage.get(name, true) ? `checked` : ``}"></div>
                    <div class="home_viewsettings_label">${text}</div>
                </div>
            `);

            document.querySelector("#" + name).addEventListener("click", function(e) {
                state = !state;

                let el = document.querySelector(elSelector);
                if (el) {
                    el.classList.remove("es_show");
                    el.classList.remove("es_hide");
                    el.style.display = state ? "block" : "none";
                }

                e.target.closest(".home_viewsettings_checkboxrow").querySelector(".home_viewsettings_checkbox").classList.toggle("checked", state);
                document.querySelector("body").classList.toggle(name.replace("show_", "es_") + "_hidden", !state);

                SyncedStorage.set(name, state);

                if (callback) { callback(); }
            });
        }

        addToggleHandler("show_apppage_recentupdates", ".early_access_announcements");
        addToggleHandler("show_apppage_reviews", "#game_area_reviews");
        addToggleHandler("show_apppage_about", "#game_area_description");
        addToggleHandler("show_steamchart_info", "#steam-charts", Localization.str.charts.current, true, function(){
            if (document.querySelector("#steam-charts")) { return; }
            instance.data.then(result => addSteamChart.call(instance, result));
        });
        addToggleHandler("show_steamspy_info", "#steam-spy", Localization.str.spy.player_data, true, function(){
            if (document.querySelector("#steam-spy")) { return; }
            instance.data.then(result => addSteamSpy.call(instance, result));
        });
        addToggleHandler("show_apppage_surveys", "#performance_survey", Localization.str.survey.performance_survey, true, function(){
            if (document.querySelector("#performance_survey")) { return; }
            instance.data.then(result => addSurveyData.call(instance, result));
        });
        addToggleHandler("show_apppage_sysreq", ".sys_req");
        addToggleHandler("show_apppage_legal", "#game_area_legal", Localization.str.apppage_legal);

        if (document.querySelector("#recommended_block")) {
            addToggleHandler("show_apppage_morelikethis", "#recommended_block", document.querySelector("#recommended_block h4").textContent);
        }
        addToggleHandler("show_apppage_recommendedbycurators", ".steam_curators_block");
        if (document.querySelector(".user_reviews_header")) {
            addToggleHandler("show_apppage_customerreviews", "#app_reviews_hash", document.querySelector(".user_reviews_header").textContent);
        }
    };

    AppPageClass.prototype.addReviewToggleButton = function() {
        let head = document.querySelector("#review_create h1");
        if (!head) { return; }
        head.insertAdjacentHTML("beforeend", "<div style='float: right;'><a class='btnv6_lightblue_blue btn_mdium' id='es_review_toggle'><span>▲</span></a></div>");

        let reviewSectionNode = document.createElement("div");
        reviewSectionNode.setAttribute("id", "es_review_section");

        let nodes = document.querySelector("#review_container").querySelectorAll("p, .avatar_block, .content");
        for (let i=0, len=nodes.length; i<len; i++) {
            let node = nodes[i];
            reviewSectionNode.append(node);
        }

        head.insertAdjacentElement("afterend", reviewSectionNode);

        function toggleReviews() {
            if (LocalData.get("show_review_section")) {
                document.querySelector("#es_review_toggle span").textContent = "▲";
                document.querySelector("#es_review_section").style.maxHeight = null;
            } else {
                document.querySelector("#es_review_toggle span").textContent = "▼";
                document.querySelector("#es_review_section").style.maxHeight = 0;
            }
        }

        toggleReviews();

        document.querySelector("#es_review_toggle").addEventListener("click", function() {
            LocalData.set("show_review_section", !LocalData.get("show_review_section"))
            toggleReviews();
        });
    };

    AppPageClass.prototype.addHelpButton = function() {
        let node = document.querySelector(".game_area_play_stats .already_owned_actions");
        if (!node) { return; }
        node.insertAdjacentHTML("afterend", "<div class='game_area_already_owned_btn'><a class='btnv6_lightblue_blue btnv6_border_2px btn_medium' href='https://help.steampowered.com/wizard/HelpWithGame/?appid=" + this.appid + "'><span>" + Localization.str.get_help + "</span></a></div>");
    };

    AppPageClass.prototype.addPackBreakdown = function() {

        function splitPack(node, ways) {
            let price_text = node.querySelector(".discount_final_price").innerHTML;
            if (price_text == null) { price_text = node.querySelector(".game_purchase_price").innerHTML; }
            if (price_text.match(/,\d\d(?!\d)/)) {
                price_text = price_text.replace(",", ".");
            }
            let price = (Number(price_text.replace(/[^0-9\.]+/g,""))) / ways;
            price = new Price(Math.ceil(price * 100) / 100);

            let buttons = node.querySelectorAll(".btn_addtocart");
            buttons[buttons.length-1].parentNode.insertAdjacentHTML("afterbegin", `
                <div class="es_each_box">
                    <div class="es_each_price">${price}</div>
                    <div class="es_each">${Localization.str.each}</div>
                </div>`);
        }

        let nodes = document.querySelectorAll(".game_area_purchase_game_wrapper");
        for (let i=0, len=nodes.length; i<len; i++) {
            let node = nodes[i];

            let title = node.querySelector("h1").textContent.trim();
            title = title.toLowerCase().replace(/-/g, ' ');
            if (!title || !title.contains('pack')) return;
            if (title.contains('pack') && title.contains('season')) return;

            if (title.contains(' 2 pack') && !title.contains('bioshock')) { splitPack.call(node, 2); }
            else if (title.contains(' two pack')) { splitPack.call(node, 2); }
            else if (title.contains('tower wars friend pack')) { splitPack.call(node, 2); }

            else if (title.contains(' 3 pack') && !title.contains('doom 3')) { splitPack.call(node, 3); }
            else if (title.contains(' three pack')) { splitPack.call(node, 3); }
            else if (title.contains('tower wars team pack')) { splitPack.call(node, 3); }

            else if (title.contains(' 4 pack')) { splitPack.call(node, 4); }
            else if (title.contains(' four pack')) { splitPack.call(node, 4); }
            else if (title.contains(' clan pack')) { splitPack.call(node, 4); }

            else if (title.contains(' 5 pack')) { splitPack.call(node, 5); }
            else if (title.contains(' five pack')) { splitPack.call(node, 5); }

            else if (title.contains(' 6 pack')) { splitPack.call(node, 6); }
            else if (title.contains(' six pack')) { splitPack.call(node, 6); }
        }
    };

    return AppPageClass;
})();


let RegisterKeyPageClass = (function(){

    function RegisterKeyPageClass() {
        this.activateMultipleKeys();
    }

    RegisterKeyPageClass.prototype.activateMultipleKeys = function() {
        let activateModalTemplate = `<div id="es_activate_modal">
                <div id="es_activate_modal_content">
                    <div class="newmodal_prompt_with_textarea gray_bevel fullwidth" id="es_activate_input_text">
                        <textarea name="es_key_input" id="es_key_input" rows="24" cols="12" maxlength="1080">__alreadyentered__</textarea>
                    </div>
                    <div class="es_activate_buttons" style="float: right">
                        <div class="btn_green_white_innerfade btn_medium es_activate_modal_submit">
                            <span>${Localization.str.activate_products}</span>
                        </div>
                        <div class="es_activate_modal_close btn_grey_white_innerfade btn_medium">
                            <span>${Localization.str.cancel}</span>
                        </div>
                    </div>
                </div>
            </div>`;

        document.querySelector("#register_btn").addEventListener("click", function(e) {
            if (document.querySelector("#product_key").value.indexOf(",") > 0) {
                e.preventDefault();
                ExtensionLayer.runInPageContext('function() { ShowDialog("' + Localization.str.activate_multiple_header + '", \`' + activateModalTemplate.replace("__alreadyentered__", document.querySelector("#product_key").value.replace(/\,/g, "\n")) + '\`); }');
            }
        });

        // Show note input modal
        document.addEventListener("click", function(e){
            if (!e.target.closest("#es_activate_multiple")) { return; }
            ExtensionLayer.runInPageContext('function() { ShowDialog("' + Localization.str.activate_multiple_header + '", \`' + activateModalTemplate.replace("__alreadyentered__", document.querySelector("#product_key").value.replace(/\,/g, "\n")) + '\`); }');
        });

        // Insert the "activate multiple products" button
        document.querySelector("#registerkey_examples_text").insertAdjacentHTML("beforebegin",
            "<a class='btnv6_blue_hoverfade btn_medium' id='es_activate_multiple' style='margin-bottom: 15px;'><span>" + Localization.str.activate_multiple + "</span></a><div style='clear: both;'></div>");

        // Process activation

        document.addEventListener("click", function(e) {
            if (!e.target.closest(".es_activate_modal_submit")) { return; }

            document.querySelector(".es_activate_modal_submit").style.display = "none";
            document.querySelector(".es_activate_modal_close").style.display = "none";

            let keys = [];

            // turn textbox into table to display results
            let lines = document.querySelector("#es_key_input").value.split("\n");
            document.querySelector("#es_activate_input_text").insertAdjacentHTML("beforebegin", "<div id='es_activate_results'></div>");
            document.querySelector("#es_activate_input_text").style.display = "none";

            lines.forEach(line => {
                let attempt = String(line);
                if (attempt === "") { // skip blank rows in the input dialog (including trailing newline)
                    return;
                }
                keys.push(attempt);

                let url = ExtensionLayer.getLocalUrl("img/questionmark.png");

                document.querySelector("#es_activate_results")
                    .insertAdjacentHTML("beforeend", "<div style='margin-bottom: 8px;'><span id='attempt_" + attempt + "_icon'><img src='" + url + "' style='padding-right: 10px; height: 16px;'></span>" + attempt + "</div><div id='attempt_" + attempt + "_result' style='margin-left: 26px; margin-bottom: 10px; margin-top: -5px;'></div>");
            });

            // force recalculation of the modal's position so it doesn't extend off the bottom of the page
            setTimeout(function(){
                window.dispatchEvent(new Event("resize"));
            }, 250);

            // attempt to activate each key in sequence
            let promises = [];

            for (let i = 0; i < keys.length; i++) {
                let current_key = keys[i];
                let request = Request.post("//store.steampowered.com/account/ajaxregisterkey", {
                    sessionid: User.getSessionId(),
                    product_key: current_key
                }).then(data => {

                    let attempted = current_key;
                    let message = Localization.str.register.default;
                    if (data["success"] == 1) {
                        document.querySelector("#attempt_" + attempted + "_icon img").setAttribute("src", ExtensionLayer.getLocalUrl("img/sr/okay.png"));
                        if (data["purchase_receipt_info"]["line_items"].length > 0) {
                            document.querySelector("#attempt_" + attempted + "_result").textContent = Localization.str.register.success.replace("__gamename__", data["purchase_receipt_info"]["line_items"][0]["line_item_description"]);
                            document.querySelector("#attempt_" + attempted + "_result").style.display = "block"; // TODO slideDown
                        }
                    } else {
                        switch(data["purchase_result_details"]) {
                            case 9: message = Localization.str.register.owned; break;
                            case 13: message = Localization.str.register.notavail; break;
                            case 14: message = Localization.str.register.invalid; break;
                            case 15: message = Localization.str.register.already; break;
                            case 24: message = Localization.str.register.dlc; break;
                            case 50: message = Localization.str.register.wallet; break;
                            case 53: message = Localization.str.register.toomany; break;
                        }
                        document.querySelector("#attempt_" + attempted + "_icon img").setAttribute("src", ExtensionLayer.getLocalUrl("img/sr/banned.png"));
                        document.querySelector("#attempt_" + attempted + "_result").textContent = message;
                        document.querySelector("#attempt_" + attempted + "_result").style.display="block"; // TODO slideDown
                    }

                }, () => {
                    let attempted = current_key;
                    document.querySelector("#attempt_" + attempted + "_icon img").setAttribute("src", ExtensionLayer.getLocalUrl("img/sr/banned.png"));
                    document.querySelector("#attempt_" + attempted + "_result").textContent = Localization.str.error;
                    document.querySelector("#attempt_" + attempted + "_result").style.display = "block"; // TODO slideDown
                });

                promises.push(request);
            }

            Promise.all(promises).then(result => {
                document.querySelector(".es_activate_modal_close span").textContent = Localization.str.close;
                document.querySelector(".es_activate_modal_close").style.display = "block";
                window.dispatchEvent(new Event("resize"));
            });
        });

        // Bind the "Cancel" button to close the modal
        document.addEventListener("click", function(e) {
            if (!e.target.closest(".es_activate_modal_close")) { return; }
            ExtensionLayer.runInPageContext(function(){ CModal.DismissActiveModal(); });
        })
    };

    return RegisterKeyPageClass;
})();


let AccountPageClass = (function(){

    function AccountPageClass() {
        this.accountTotalSpent();
    }

    AccountPageClass.prototype.accountTotalSpent = function() {

        let links = document.querySelector(".account_setting_block")
            .querySelector(".account_setting_sub_block:nth-child(2)")
            .querySelectorAll(".account_manage_link");

        let lastLink = links[links.length-1];
        lastLink.parentNode.insertAdjacentHTML("afterend",
            `<div><a class='account_manage_link' href='https://help.steampowered.com/en/accountdata/AccountSpend'>${Localization.str.external_funds}</a></div>`);
    };

    return AccountPageClass;
})();


let FundsPageClass = (function(){

    function FundsPageClass() {
        this.addCustomMoneyAmount();
    }

    FundsPageClass.prototype.addCustomMoneyAmount = function() {
        let giftcard = document.querySelector(".giftcard_amounts");

        let newel = document.querySelector(giftcard ? ".giftcard_selection" : ".addfunds_area_purchase_game").cloneNode(true);
        let priceel = newel.querySelector((giftcard ? ".giftcard_text" : ".price"));
        let price = priceel.textContent.trim();

        newel.classList.add("es_custom_money");
        if(!giftcard) {
            newel.querySelector(".btnv6_green_white_innerfade").classList.add("es_custom_button");
            newel.querySelector("h1").textContent = Localization.str.wallet.custom_amount;
            newel.querySelector("p").textContent = Localization.str.wallet.custom_amount_text.replace("__minamount__", price);
        } else {
            newel.querySelector(".giftcard_style")
                .innerHTML = Localization.str.wallet.custom_giftcard_amount
                    .replace("__minamount__", price)
                    .replace("__input__", "<span id='es_custom_money_amount_wrapper'></span>");
        }

        let currency = Price.parseFromString(price);

        let inputel = newel.querySelector((giftcard ? "#es_custom_money_amount_wrapper" : ".price"));
        inputel.innerHTML = "<input type='number' id='es_custom_money_amount' class='es_text_input money' min='" + currency.value + "' step='.01' value='" + currency.value +"'>";
        // TODO currency symbol

        document.querySelector((giftcard ? ".giftcard_selection" : ".addfunds_area_purchase_game"))
            .insertAdjacentElement("afterend", newel);

        document.querySelector("#es_custom_money_amount").addEventListener("input", function() {
            let value = document.querySelector("#es_custom_money_amount").value;

            if(!isNaN(value) && value != "") {
                currency.value = value;

                if(giftcard) {
                    priceel.classList.toggle("small", value > 10);
                    priceel.textContent = currency;
                }
            }
        });

        newel.querySelector((giftcard ? ".es_custom_money a.btn_medium" : ".es_custom_button")).addEventListener("click", function(e) {
            e.preventDefault();

            let jsvalue = (+document.querySelector("#es_custom_money_amount").value).toFixed(2).replace(/[,.]/g, '');

            if (giftcard) {

                if (e.target.closest(".giftcard_cont")) {
                    ExtensionLayer.runInPageContext('function(){ submitSelectGiftCard(' + jsvalue + '); }');
                }

            } else {
                let btn = document.querySelector(".es_custom_money .es_custom_button");
                btn.href = "#";
                btn.removeAttribute("onclick");
                btn.dataset.amount = jsvalue;

                ExtensionLayer.runInPageContext('function(){ submitAddFunds(document.querySelector(".es_custom_money .es_custom_button")); }');
            }

        });

        let giftcardMoneyNode = document.querySelector(".giftcard_selection #es_custom_money_amount");
        if (giftcardMoneyNode) {
            giftcardMoneyNode.addEventListener("click", function(e) {
                e.preventDefault();
            });
        }
    };

    return FundsPageClass;
})();


let SearchPageClass = (function(){

    function SearchPageClass() {
        this.endlessScrolling();
        this.addExcludeTagsToSearch();
        this.addHideButtonsToSearch();
    }

    let processing = false;
    let searchPage = 2;

    function loadSearchResults () {
        if (processing) { return; }
        processing = true;

        let search = document.URL.match(/(.+)\/(.+)/)[2].replace(/\&page=./, "").replace(/\#/g, "&");
        if (!document.querySelector(".LoadingWrapper")) {
            let nodes = document.querySelectorAll(".search_pagination");
            nodes[nodes.length-1].insertAdjacentHTML("beforebegin", '<div class="LoadingWrapper"><div class="LoadingThrobber" style="margin-bottom: 15px;"><div class="Bar Bar1"></div><div class="Bar Bar2"></div><div class="Bar Bar3"></div></div><div id="LoadingText">' + Localization.str.loading + '</div></div>');
        }

        if (search.substring(0,1) == "&") { search = "?" + search.substring(1, search.length); }
        if (search.substring(0,1) != "?") { search = "?" + search; }

        Request.getHttp("//store.steampowered.com/search/results" + search + '&page=' + searchPage + '&snr=es').then(result => {
            let dummy = document.createElement("html");
            dummy.innerHTML = result;

            let addedDate = Date.now();
            document.querySelector('#search_result_container').dataset.lastAddDate = addedDate;

            let lastNode = document.querySelector(".search_result_row:last-child");

            let rows = dummy.querySelectorAll("a.search_result_row");
            for (let i=0, len=rows.length; i<len; i++) {
                let row = rows[i];
                row.dataset.addedDate = addedDate;
                lastNode.insertAdjacentElement("afterend", row);
                lastNode = row;

                row.removeAttribute("onmouseover");
                row.removeAttribute("onmouseout");
            }

            document.querySelector(".LoadingWrapper").remove();

            searchPage = searchPage + 1;
            processing = false;

            let inContext = function () {
                let addedDate = document.querySelector('#search_result_container').dataset.lastAddDate;
                GDynamicStore.DecorateDynamicItems(jQuery('.search_result_row[data-added-date="' + addedDate + '"]'));
                SetupTooltips( { tooltipCSSClass: 'store_tooltip'} );
            };

            ExtensionLayer.runInPageContext(inContext);
        }, failed => {
            document.querySelector(".LoadingWrapper").remove();
            document.querySelector(".search_pagination:last-child").insertAdjacentHTML("beforebegin", "<div style='text-align: center; margin-top: 16px;' id='es_error_msg'>" + Localization.str.search_error + ". <a id='es_retry' style='cursor: pointer;'>" + Localization.str.search_error_retry + ".</a></div>");

            $("#es_retry").click(function() {
                processing = false;
                $("#es_error_msg").remove();
                loadSearchResults();
            });
        });
    }

    SearchPageClass.prototype.endlessScrolling = function() {
        if (!SyncedStorage.get("contscroll", true)) { return; }

        let result_count;
        document.body.insertAdjacentHTML("beforeend", '<link rel="stylesheet" type="text/css" href="//steamstore-a.akamaihd.net/public/css/v6/home.css">');
        document.querySelector(".search_pagination_right").style.display = "none";

        let match = document.querySelector(".search_pagination_left").textContent.trim().match(/(\d+)(?:\D+(\d+)\D+(\d+))?/);
        if (match) {
            result_count = match[2] ? Math.max.apply(Math, match.slice(1, 4)) : match[1];
            document.querySelector(".search_pagination_left").textContent = Localization.str.results.replace("__num__", result_count);
        }

        searchPage = 2;

        window.addEventListener("scroll", function () {
            // if the pagination element is in the viewport, continue loading
            if (BrowserHelper.isElementInViewport(document.querySelector(".search_pagination_left"))) {
                if (result_count > document.querySelectorAll(".search_result_row").length) {
                    loadSearchResults();
                } else {
                    document.querySelector(".search_pagination_left").textContent = Localization.str.all_results.replace("__num__", result_count);
                }
            }
        });
    };

    SearchPageClass.prototype.addExcludeTagsToSearch = function() {
        let tarFilterDivs = document.querySelectorAll('#TagFilter_Container')[0].children;

        document.querySelector("#TagFilter_Container").parentNode.parentNode.insertAdjacentHTML("afterend",
            `<div class='block' id='es_tagfilter_exclude'>
                <div class='block_header'>
                    <div>${Localization.str.exclude_tags}</div>
                 </div>
                 <div class='block_content block_content_inner'>
                    <div style='max-height: 150px; overflow: hidden;' id='es_tagfilter_exclude_container'></div>
                    <input type="text" id="es_tagfilter_exclude_suggest" class="blur es_input_text">
                </div>
            </div>
        `);

        let excludeContainer = document.querySelector("#es_tagfilter_exclude_container");

        //tag numbers from the URL are already in the element with id #tags
        function getTags() {
            let tagsValue = decodeURIComponent(document.querySelector("#tags").value);
            return tagsValue ? tagsValue.split(',') : [];
        }

        for (let i=0, len=tarFilterDivs.length; i<len; i++) {
            let val = tarFilterDivs[i];

            let item_checked = getTags().indexOf("-"+val.dataset.value) > -1 ? "checked" : "";

            let excludeItem = BrowserHelper.htmlToElement(
                `<div class="tab_filter_control ${item_checked}" data-param="tags" data-value="-${val.dataset.value}" data-loc="${val.dataset.loc}">
                    <div class="tab_filter_control_checkbox"></div>
                    <span class="tab_filter_control_label">${val.dataset.loc}</span>
                </div>`);

            excludeItem.addEventListener("click", function(e) {
                let control = e.target.closest(".tab_filter_control")

                let rgValues = getTags();
                let value = String(control.dataset.value);
                if (!control.classList.contains("checked")) {

                    if(!rgValues) {
                        rgValues = [value];
                    } else if (rgValues.indexOf(value) === -1) {
                        rgValues.push(value);
                    }

                } else {

                    if (rgValues.indexOf(value) !== -1) {
                        rgValues.splice(rgValues.indexOf(value), 1);
                    }
                }

                control.classList.toggle('checked');
                document.querySelector("#tags").value = rgValues.join(',');
                ExtensionLayer.runInPageContext(function() {AjaxSearchResults();});
            });

            excludeContainer.append(excludeItem);
        }

        ExtensionLayer.runInPageContext(function() {
            $J('#es_tagfilter_exclude_container').tableFilter({ maxvisible: 15, control: '#es_tagfilter_exclude_suggest', dataattribute: 'loc', 'defaultText': jQuery("#TagSuggest")[0].value });
        });

        let observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation){
                if (!mutation["addedNodes"]) { return; }

                let addedNodes = mutation["addedNodes"];
                for (let i=0; i<addedNodes.length; i++) {
                    let node = addedNodes[i].parentNode;
                    if (node.classList.contains("tag_dynamic") && parseFloat(node.dataset['tag_value']) < 0) {
                        node.querySelector(".label").textContent = Localization.str.not.replace("__tag__", node.textContent);
                    }
                }
            });
        });
        observer.observe(document.querySelector(".termcontainer"), {childList:true, subtree:true});
        ExtensionLayer.runInPageContext(function() {UpdateTags()});
    };


    function applyPriceFilter(node) {
        let hidePriceAbove = SyncedStorage.get("priceabove_value", false);
        let priceAboveValue = SyncedStorage.get("priceabove_value", "");

        if (hidePriceAbove
            && priceAboveValue !== ""
            && !(Number.isNaN(priceAboveValue))) {

            let html = node.querySelector("div.col.search_price.responsive_secondrow").innerHTML;
            let intern = html.replace(/<([^ >]+)[^>]*>.*?<\/\1>/, "").replace(/<\/?.+>/, "");
            let parsed = new Price(intern.trim());
            if (parsed && parsed.value > priceAboveValue) {
                node.style.display = "none";
            }
        }

        if (BrowserHelper.isElementInViewport(document.querySelector(".search_pagination_left"))) {
            loadSearchResults();
        }
    }

    function addHideButtonsToSearchClick() {
        let nodes = document.querySelectorAll(".search_result_row");
        for (let i=0, len=nodes.length; i<len; i++) {
            let node = nodes[i];

            node.style.display = "block";
            if (document.querySelector("#es_owned_games.checked") && node.classList.contains("ds_owned")) { node.style.display = "none"; }
            if (document.querySelector("#es_wishlist_games.checked") && node.classList.contains("ds_wishlist")) { node.style.display = "none"; }
            if (document.querySelector("#es_cart_games.checked") && node.classList.contains("ds_incart")) { node.style.display = "none"; }
            if (document.querySelector("#es_notdiscounted.checked") && !node.querySelector(".search_discount span")) { node.style.display = "none"; }
            if (document.querySelector("#es_notinterested.checked")) { Highlights.highlightNotInterested(node); }
            if (document.querySelector("#es_notmixed.checked") && node.querySelector(".search_reviewscore span.search_review_summary.mixed")) { node.style.display = "none"; }
            if (document.querySelector("#es_notnegative.checked") && node.querySelector(".search_reviewscore span.search_review_summary.negative")) { node.style.display = "none"; }
            if (document.querySelector("#es_notpriceabove.checked")) { applyPriceFilter(node); }
        }
    }

    function validatePrice (priceText, e) {
        if (e.key === "Enter") { return true; }
        priceText += e.key;
        let price = Number(priceText);
        return !(Number.isNaN(price));
    }

    SearchPageClass.prototype.addHideButtonsToSearch = function() {

        document.querySelector("#advsearchform .rightcol").insertAdjacentHTML("afterbegin", `
            <div class='block' id='es_hide_menu'>
                <div class='block_header'><div>` + Localization.str.hide + `</div></div>
                <div class='block_content block_content_inner' style='height: 150px;' id='es_hide_options'>
                    <div class='tab_filter_control' id='es_owned_games'>
                        <div class='tab_filter_control_checkbox'></div>
                        <span class='tab_filter_control_label'>` + Localization.str.options.owned + `</span>
                    </div>
                    <div class='tab_filter_control' id='es_wishlist_games'>
                        <div class='tab_filter_control_checkbox'></div>
                        <span class='tab_filter_control_label'>` + Localization.str.options.wishlist + `</span>
                    </div>
                    <div class='tab_filter_control' id='es_cart_games'>
                        <div class='tab_filter_control_checkbox'></div>
                        <span class='tab_filter_control_label'>` + Localization.str.options.cart + `</span>
                    </div>
                    <div class='tab_filter_control' id='es_notdiscounted'>
                        <div class='tab_filter_control_checkbox'></div>
                        <span class='tab_filter_control_label'>` + Localization.str.notdiscounted + `</span>
                    </div>
                    <div class='tab_filter_control' id='es_notinterested'>
                        <div class='tab_filter_control_checkbox'></div>
                        <span class='tab_filter_control_label'>` + Localization.str.notinterested + `</span>
                    </div>
                    <div class='tab_filter_control' id='es_notmixed'>
                        <div class='tab_filter_control_checkbox'></div>
                        <span class='tab_filter_control_label'>` + Localization.str.mixed_item + `</span>
                    </div>
                    <div class='tab_filter_control' id='es_notnegative'>
                        <div class='tab_filter_control_checkbox'></div>
                        <span class='tab_filter_control_label'>` + Localization.str.negative_item + `</span>
                    </div>
                    <div class='tab_filter_control' id='es_notpriceabove'>
                        <div class='tab_filter_control_checkbox'></div>
                        <span class='tab_filter_control_label'>` + Localization.str.price_above + `</span>
                        <div>
                            <input type="number" id='es_notpriceabove_val' class='es_input_number' step=0.01>
                        </div>
                    </div>
                </div>
                <a class="see_all_expander" href="#" id="es_hide_expander"></a>
            </div>
        `);

        let expander = document.querySelector("#es_hide_expander");
        expander.addEventListener("click", function(e) {
            e.preventDefault();
            ExtensionLayer.runInPageContext(function(){
                ExpandOptions(document.querySelector("#es_hide_expander"), 'es_hide_options')
            });
        });

        let all = document.querySelectorAll(".see_all_expander");
        expander.textContent = all[all.length-1].textContent;

        if (SyncedStorage.get("hide_owned", false)) {
            document.querySelector("#es_owned_games").classList.add("checked");
        }

        if (SyncedStorage.get("hide_wishlist", false)) {
            document.querySelector("#es_wishlist_games").classList.add("checked");
        }

        if (SyncedStorage.get("hide_cart", false)) {
            document.querySelector("#es_cart_games").classList.add("checked");
        }

        if (SyncedStorage.get("hide_notdiscounted", false)) {
            document.querySelector("#es_notdiscounted").classList.add("checked");
        }

        if (SyncedStorage.get("hide_notinterested", false)) {
            document.querySelector("#es_notinterested").classList.add("checked");
        }

        if (SyncedStorage.get("hide_mixed", false)) {
            document.querySelector("#es_notmixed").classList.add("checked");
            document.querySelector("#es_hide_options").style.height="auto";
            document.querySelector("#es_hide_expander").style.display="none";

            let nodes = document.querySelectorAll(".search_result_row span.search_review_summary.mixed");
            for (let i=0, len=nodes.length; i<len; i++) {
                nodes[i].closest(".search_result_row").style.display="none";
            }
        }

        if (SyncedStorage.get("hide_negative", false)) {
            document.querySelector("#es_notnegative").classList.add("checked");
            document.querySelector("#es_hide_options").style.height = "auto";
            document.querySelector("#es_hide_expander").style.display = "none";

            let nodes = document.querySelectorAll(".search_result_row span.search_review_summary.negative");
            for (let i=0, len=nodes.length; i<len; i++) {
                nodes[i].closest(".search_result_row").style.display="none";
            }
        }

        if (SyncedStorage.get("hide_priceabove", false)) {
            document.querySelector("#es_notpriceabove").classList.add("checked");
            document.querySelector("#es_hide_options").style.height = "auto";
            document.querySelector("#es_hide_expander").style.display = "none";

            let nodes = document.querySelectorAll(".search_result_row");
            for (let i=0, len=nodes.length; i<len; i++) {
                applyPriceFilter(nodes[i])
            }
        }

        if (SyncedStorage.get("priceabove_value", "") ) {
            document.querySelector("#es_notpriceabove_val").value = SyncedStorage.get("priceabove_value", "");
        }

        [
            ["#es_owned_games", "hide_owned"],
            ["#es_wishlist_games", "hide_wishlist"],
            ["#es_cart_games", "hide_cart"],
            ["#es_notdiscounted", "hide_notdiscounted"],
            ["#es_notinterested", "hide_notinterested"],
            ["#es_notmixed", "hide_mixed"],
            ["#es_notnegative", "hide_negative"],
            ["#es_notpriceabove", "hide_priceabove"],
        ].forEach(a => {
            document.querySelector(a[0]).addEventListener("click", function(e) {
                let node = document.querySelector(a[0]);
                let value = !node.classList.contains("checked");
                node.classList.toggle("checked", value);
                SyncedStorage.set(a[1], value);
                addHideButtonsToSearchClick();
            });
        });

        document.getElementById("es_notpriceabove").title = Localization.str.price_above_tooltip;

        let elem = document.getElementById("es_notpriceabove_val");
        if (elem !== undefined && elem !== null) {
            elem.title = Localization.str.price_above_tooltip;
            elem.addEventListener("click", function(e) {
                e.stopPropagation()

            });
            elem.addEventListener("keypress", function(e){
                return validatePrice(elem.value, e);
            });
            elem.addEventListener("change", function(e){
                let price = '';
                if(elem.value != ''){
                    price = Number(elem.value);
                    if(Number.isNaN(price)) {
                        price = '';
                    }
                }
                SyncedStorage.set({"priceabove_value": price });
                addHideButtonsToSearchClick()
            });
        }
    };

    return SearchPageClass;
})();


let WishlistPageClass = (function(){

    function WishlistPageClass() {

        let instance = this;
        let observer = new MutationObserver(function(){
            instance.highlightApps();
        });
        observer.observe(document.querySelector("#wishlist_ctn"), { childList:true });

        this.addWishlistTotal();

        /*
        fix_app_image_not_found();
        add_empty_wishlist_buttons();
        add_wishlist_pricehistory();
        add_wishlist_notes();

        // Wishlist highlights
        load_inventory().done(function() {
            start_highlights_and_tags();
        });
        */
    }

    WishlistPageClass.prototype.highlightApps = function() {
        if (!User.isSignedIn) { return; }

        let loginImage = document.querySelector("#global_actions .user_avatar img").getAttribute("src");
        let userImage = document.querySelector(".wishlist_header img").getAttribute("src").replace("_full", "");
        if (loginImage == userImage) { return; }

        DynamicStore.promise().then(() => {

            let nodes = document.querySelectorAll("div.wishlist_row");
            for (let i=0, len=nodes.length; i<len; i++) {
                let node = nodes[i];

                let appid = Number(node.dataset.appId);

                if (DynamicStore.isOwned(appid)) {
                    node.classList.add("ds_collapse_flag", "ds_flagged", "ds_owned");
                    if (SyncedStorage.get("higlight_owned", true)) {
                        Highlights.highlightOwned(node);
                    } else {
                        node.insertAdjacentHTML("beforeend", '<div class="ds_flag ds_owned_flag">' + Localization.str.library.in_library.toUpperCase() + '&nbsp;&nbsp;</div>');
                    }
                }

                if (DynamicStore.isWishlisted(appid)) {
                    node.classList.add("ds_collapse_flag", "ds_flagged", "ds_wishlist");

                    if (SyncedStorage.get("higlight_wishlist", true)) {
                        Highlights.highlightWishlist(node);
                    } else {
                        node.insertAdjacentHTML("beforeend", '<div class="ds_flag ds_owned_flag">' + Localization.str.library.on_wishlist.toUpperCase() + '&nbsp;&nbsp;</div>');
                    }
                }
            }
        });
    };

    // Calculate total cost of all items on wishlist
    WishlistPageClass.prototype.addWishlistTotal = function(showTotal) {

        let wishlistData;
        let nodes = document.querySelectorAll("script");
        for (let i=0, len=nodes.length; i<len; i++) {
            let node = nodes[i];
            let m = node.textContent.match(/g_rgAppInfo = (\{.+?\});/);
            if (m) {
                wishlistData = JSON.parse(m[1]);
                break;
            }
        }

        if (!wishlistData) { return; }

        let totalPrice = new Price(0);
        let totalCount = 0;
        let totalOnSale = 0;
        let totalNoPrice = 0;

        for (let key in wishlistData) {
            let game = wishlistData[key];
            if (game.subs.length > 0) {
                totalPrice.value += game.subs[0].price / 100;

                if (game.subs[0].discount_pct > 0) {
                    totalOnSale++;
                }
            } else {
                totalNoPrice++;
            }
            totalCount++;
        }

        let html =
            `<div class="esi-wishlist-chart-content">
                <div class="esi-wishlist-stat"><span class="num">${totalPrice}</span>${Localization.str.wl.total_price}</div>
                <div class="esi-wishlist-stat"><span class="num">${totalCount}</span>${Localization.str.wl.in_wishlist}</div>
                <div class="esi-wishlist-stat"><span class="num">${totalOnSale}</span>${Localization.str.wl.on_sale}</div>
                <div class="esi-wishlist-stat"><span class="num">${totalNoPrice}</span>${Localization.str.wl.no_price}</div>
            </div>`;

        document.querySelector("#wishlist_ctn").insertAdjacentHTML("beforebegin", html);
    };



    return WishlistPageClass;
})();


(function(){
    let path = window.location.pathname.replace(/\/+/g, "/");

    console.log("Running store");

    SyncedStorage
        .load()
        .finally(() => Promise
            .all([Localization.promise(), User.promise(), Currency.promise()])
            .then(function(values) {
                console.log("ES loaded");

                ProgressBar.create();
                EnhancedSteam.checkVersion();
                EnhancedSteam.addMenu();
                EnhancedSteam.addLanguageWarning();
                EnhancedSteam.removeInstallSteamButton();
                EnhancedSteam.addHeaderLinks();
                EarlyAccess.showEarlyAccess();
                EnhancedSteam.disableLinkFilter();
                EnhancedSteam.skipGotSteam();
                EnhancedSteam.keepSteamSubscriberAgreementState();

                if (User.isSignedIn) {
                    EnhancedSteam.addRedeemLink();
                    EnhancedSteam.replaceAccountName();
                    EnhancedSteam.launchRandomButton();
                    // TODO add itad sync
                }

                // FIXME this should have better check for log out, not just logout link click
                // $('a[href$="javascript:Logout();"]').bind('click', clear_cache);

                // end of common part


                switch (true) {
                    case /\bagecheck\b/.test(path):
                        AgeCheck.sendVerification();
                        break;

                    case /^\/app\/.*/.test(path):
                        (new AppPageClass(window.location.host + path));
                        break;

                    case /^\/sub\/.*/.test(path):
                        (new SubPageClass(window.location.host + path));
                        break;

                    case /^\/bundle\/.*/.test(path):
                        (new BundlePageClass(window.location.host + path));
                        break;

                    case /^\/account\/registerkey(\/.*)?/.test(path):
                        (new RegisterKeyPageClass());
                        return;

                    case /^\/account(\/.*)?/.test(path):
                        (new AccountPageClass());
                        return;

                    case /^\/(steamaccount\/addfunds|digitalgiftcards\/selectgiftcard)/.test(path):
                        (new FundsPageClass());
                        break;

                    case /^\/search\/.*/.test(path):
                        (new SearchPageClass());
                        break;

                    case /^\/sale\/.*/.test(path):
                        (new StorePageClass()).showRegionalPricing("sale");
                        break;

                    case /^\/wishlist\/(?:id|profiles)\/.+(\/.*)?/.test(path):
                        (new WishlistPageClass());
                        break;

                    // Storefront-front only
                    case /^\/$/.test(path):
                        add_popular_tab();
                        add_allreleases_tab();
                        set_homepage_tab();
                        highlight_recommendations();
                        customize_home_page();
                        break;
                }


                // Alternative Linux icon
//                alternative_linux_icon();

                // Highlights & data fetching
                Highlights.startHighlightsAndTags();

                /*
                // Storefront homepage tabs
                bind_ajax_content_highlighting();
                hide_trademark_symbols();
                set_html5_video();
                //get_store_session();
                fix_menu_dropdown();
*/

            })
    )

})();

