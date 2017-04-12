﻿import React, { Component } from 'react';
import classNames from "classnames";
import styles from './index.scss';
import fontStyles from 'webapp/fonts/font-awesome.scss';
import Search from 'webapp/components/Search';
import Service from 'world/Service';
import MathUtils from 'world/math/Utils';

export default class Result extends Component {
    static contextTypes = {
        router: React.PropTypes.object
    };

    constructor(props) {
        super(props);
        this.pageCapacity = 10;
        this.distance = 1000;
        this.nameClassNames = classNames(styles.name, "ellipsis");
        this.addressClassNames = classNames(styles.address, "ellipsis");
        this.roadIcon = classNames(fontStyles.fa, fontStyles["fa-road"]);
        this.leftIcon = classNames(fontStyles.fa, fontStyles["fa-angle-left"]);
        this.rightIcon = classNames(fontStyles.fa, fontStyles["fa-angle-right"]);
        this.state = {
            total: 0,
            pageIndex: 0,
            pois: []
        };
    }

    componentDidMount() {
        this._isMounted = true;
        Service.location().then((location) => {
            this.location = location;
        }).then(() => {
            this.search(0);
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onMap() {
        console.log("onMap");
    }

    onList() {
        console.log("onList");
    }

    onCancel() {
        this.context.router.goBack();
    }

    onPrevPage() {
        this.search(this.state.pageIndex - 1);
    }

    onNextPage() {
        this.search(this.state.pageIndex + 1);
    }

    search(pageIndex) {
        const distance = this.distance;
        const keyword = this.props.location.query.keyword;
        if (this._isMounted && this.location && keyword) {
            Service.searchNearby(keyword, this.location.lon, this.location.lat, distance, this.pageCapacity, pageIndex).then((response) => {
                if (!this._isMounted) {
                    return;
                }
                if (response) {
                    this.setState({
                        total: response.info.total,
                        pageIndex: pageIndex,
                        pois: response.detail.pois
                    });
                }
            });
        }
    }

    render() {
        const {
            total,
            pageIndex,
            pois
        } = this.state;

        const totalPageCount = Math.ceil(total / this.pageCapacity);
        const showPrevPage = pageIndex > 0;
        const showNextPage = pageIndex < totalPageCount - 1;

        return (
            <div>
                <Search placeholder={this.props.location.query.keyword || ""} showMapList={true} showCancel={true} onMap={() => this.onMap()} onList={() => this.onList()} onCancel={() => this.onCancel()} onFocus={() => this.onCancel()} />
                <div className={styles.pois}>
                    {
                        this.state.pois.map((poi, index) => {
                            var distance = MathUtils.getRealArcDistanceBetweenLonLats(this.location.lon, this.location.lat, poi.pointx, poi.pointy);
                            distance = Math.floor(distance);
                            return (
                                <div className={styles.poi} key={poi.uid}>
                                    <div className={styles.index}>{index + 1}</div>
                                    <div className={styles.info}>
                                        <div className={this.nameClassNames}>{poi.name}</div>
                                        <div className={this.addressClassNames}>{poi.addr}</div>
                                    </div>
                                    <div className={styles.distance}>
                                        <i className={this.roadIcon}></i>
                                        <div>{distance}米</div>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
                <div className={styles.footer}>
                    {
                        showPrevPage && (
                            <div className={styles["prev-page"]} onClick={() => this.onPrevPage()}>
                                <i className={this.leftIcon}></i>
                                <span>上一页</span>
                            </div>
                        )
                    }
                    <div className={styles["current-page"]}>
                        {pageIndex+1} / {totalPageCount}
                    </div>
                    {
                        showNextPage && (
                            <div className={styles["next-page"]} onClick={() => this.onNextPage()}>
                                <span>下一页</span>
                                <i className={this.rightIcon}></i>
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
};